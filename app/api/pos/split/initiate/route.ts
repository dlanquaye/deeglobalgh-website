export const runtime = "nodejs";

import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  LocationType,
  OrderPaymentStatus,
  PaymentMethod,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  getLegacyOrderAmount,
} from "@/lib/pos/orderMoney";

import {
  PosPricingPreparationError,
  preparePosPricing,
} from "@/lib/pos/preparePosPricing";

import type {
  RawPosDiscountInput,
} from "@/lib/pos/preparePosPricing";

import {
  PosDiscountActorError,
  resolvePosDiscountActor,
} from "@/lib/pos/resolvePosDiscountActor";

import type {
  DiscountActorInput,
  DiscountProductInput,
} from "@/lib/pos/discounts";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

type CheckoutItem = {
  id: string;
  quantity: number;
};

type PaystackProvider =
  | "mtn"
  | "atl"
  | "vod";

type PaystackChargeResponse = {
  status?: boolean;
  message?: string;

  data?: {
    reference?: string;
    status?: string;
    display_text?: string;
    amount?: number;
    currency?: string;
    message?: string | null;
  };
};

class SplitInitiationError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);

    this.name =
      "SplitInitiationError";

    this.status =
      status;
  }
}

async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore =
    await cookies();

  const rawCookie =
    cookieStore.get(
      "dg_admin"
    )?.value;

  if (!rawCookie) {
    return null;
  }

  try {
    return JSON.parse(
      decodeURIComponent(
        rawCookie
      )
    ) as AdminSession;
  } catch {
    return null;
  }
}

function normaliseItems(
  items: unknown
): CheckoutItem[] {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new SplitInitiationError(
      "No items provided"
    );
  }

  const quantitiesByProduct =
    new Map<string, number>();

  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      !("id" in item) ||
      !("quantity" in item)
    ) {
      throw new SplitInitiationError(
        "Invalid checkout item"
      );
    }

    const id =
      String(item.id);

    const quantity =
      Number(
        item.quantity
      );

    if (!id) {
      throw new SplitInitiationError(
        "Invalid product"
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      throw new SplitInitiationError(
        "Product quantity must be a positive whole number"
      );
    }

    quantitiesByProduct.set(
      id,
      (
        quantitiesByProduct.get(
          id
        ) ?? 0
      ) + quantity
    );
  }

  return Array.from(
    quantitiesByProduct.entries(),
    ([id, quantity]) => ({
      id,
      quantity,
    })
  );
}

function normaliseDiscount(
  value: unknown
):
  | RawPosDiscountInput
  | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    throw new SplitInitiationError(
      "Invalid discount request"
    );
  }

  return value as
    RawPosDiscountInput;
}

function normaliseProvider(
  provider: unknown
): PaystackProvider {
  if (
    provider === "mtn" ||
    provider === "atl" ||
    provider === "vod"
  ) {
    return provider;
  }

  throw new SplitInitiationError(
    "Select a valid Mobile Money network"
  );
}

function normaliseGhanaPhone(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    throw new SplitInitiationError(
      "Customer Mobile Money number is required"
    );
  }

  let phone =
    value
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "");

  if (
    phone.startsWith(
      "+233"
    )
  ) {
    phone =
      "0" +
      phone.substring(4);
  } else if (
    phone.startsWith(
      "233"
    )
  ) {
    phone =
      "0" +
      phone.substring(3);
  }

  if (
    !/^0\d{9}$/.test(
      phone
    )
  ) {
    throw new SplitInitiationError(
      "Enter a valid Ghana Mobile Money number"
    );
  }

  return phone;
}

/*
 * Convert cashier-entered GHS into exact
 * integer pesewas.
 */
function parseGhsToPesewas(
  value: unknown
) {
  const text =
    typeof value ===
      "number"
      ? String(value)
      : typeof value ===
          "string"
        ? value.trim()
        : "";

  if (
    !/^\d+(\.\d{1,2})?$/.test(
      text
    )
  ) {
    throw new SplitInitiationError(
      "Enter a valid Cash amount with no more than two decimal places"
    );
  }

  const [
    cedisPart,
    pesewasPart = "",
  ] = text.split(".");

  const cedis =
    Number(cedisPart);

  const pesewas =
    Number(
      pesewasPart.padEnd(
        2,
        "0"
      )
    );

  if (
    !Number.isSafeInteger(
      cedis
    ) ||
    !Number.isSafeInteger(
      pesewas
    )
  ) {
    throw new SplitInitiationError(
      "Invalid Cash amount"
    );
  }

  const result =
    cedis * 100 +
    pesewas;

  if (
    !Number.isSafeInteger(
      result
    )
  ) {
    throw new SplitInitiationError(
      "Cash amount is too large"
    );
  }

  return result;
}

function createOrderId() {
  return (
    `POS-${Date.now()}-` +
    randomBytes(
      3
    ).toString("hex")
  );
}

function createReceiptToken() {
  return randomBytes(
    24
  ).toString(
    "base64url"
  );
}

function createPaystackReference() {
  return (
    `POSSPLIT-${Date.now()}-` +
    randomBytes(
      6
    ).toString("hex")
  );
}

export async function POST(
  req: Request
) {
  try {
    // ==========================================
    // SESSION
    // ==========================================
    const session =
      await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!session.branchId) {
      return NextResponse.json(
        {
          error:
            "No branch is assigned to this account",
        },
        {
          status: 400,
        }
      );
    }

    const actorId =
      session.staffId ??
      session.adminId;

    if (!actorId) {
      return NextResponse.json(
        {
          error:
            "No staff or admin identity is available",
        },
        {
          status: 400,
        }
      );
    }

    const secret =
      process.env
        .PAYSTACK_POS_SECRET_KEY ??
      process.env
        .PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        {
          error:
            "Paystack is not configured",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // REQUEST
    // ==========================================
    const body =
      await req.json();

    const {
      items: rawItems,
      customerName,
      customerPhone,
      provider:
        rawProvider,
      cashAmount,
      heldSaleId:
        rawHeldSaleId,
      discount:
        rawDiscount,
    } = body;

    const items =
      normaliseItems(
        rawItems
      );

    const discount =
      normaliseDiscount(
        rawDiscount
      );

    const discountRequested =
      discount !== null;

    const provider =
      normaliseProvider(
        rawProvider
      );

    const phone =
      normaliseGhanaPhone(
        customerPhone
      );

    const cashAmountPesewas =
      parseGhsToPesewas(
        cashAmount
      );

    const branchId =
      session.branchId;

    const heldSaleId =
      typeof rawHeldSaleId ===
        "string"
        ? rawHeldSaleId.trim()
        : "";

    const providerReference =
      createPaystackReference();

    // ==========================================
    // PREPARE SPLIT ORDER
    // ==========================================
    //
    // IMPORTANT:
    //
    // 1. Product prices are fetched server-side.
    //
    // 2. Discount authority and selling floors
    //    are checked server-side.
    //
    // 3. The FINAL DISCOUNTED TOTAL is fixed
    //    before Cash is accepted.
    //
    // 4. Cash is then recorded CONFIRMED.
    //
    // 5. MoMo is calculated as:
    //
    //    discounted total - Cash.
    //
    // 6. Stock is NOT reduced here.
    // ==========================================
    const prepared =
      await prisma.$transaction(
        async (tx) => {
          // ======================================
          // OPTIONAL RESUMED HELD-SALE GUARD
          // ======================================
          //
          // Normal split sales omit heldSaleId.
          //
          // A resumed held sale must still belong
          // to this branch, remain RESUMED and
          // have no previous conversion.
          if (heldSaleId) {
            const heldSale =
              await tx.posHeldSale.findFirst({
                where: {
                  id:
                    heldSaleId,

                  branchId,

                  status:
                    "RESUMED",

                  convertedAt:
                    null,

                  convertedOrderId:
                    null,
                },

                select: {
                  id:
                    true,
                },
              });

            if (!heldSale) {
              throw new SplitInitiationError(
                "This held sale is no longer available for split payment. Refresh the held-sales list before continuing.",
                409
              );
            }
          }

          const productIds =
            items.map(
              (item) =>
                item.id
            );

          const products =
            await tx.product.findMany({
              where: {
                id: {
                  in:
                    productIds,
                },

                isActive:
                  true,
              },
            });

          const productMap =
            new Map(
              products.map(
                (product) => [
                  product.id,
                  product,
                ]
              )
            );

          for (
            const item of
            items
          ) {
            if (
              !productMap.has(
                item.id
              )
            ) {
              throw new SplitInitiationError(
                "Product not found or inactive",
                400
              );
            }
          }

          // ======================================
          // SELLING PRICE PROTECTION
          // ======================================
          for (
            const item of
            items
          ) {
            const product =
              productMap.get(
                item.id
              )!;

            if (
              !Number.isFinite(
                product.retailPrice
              ) ||
              product.retailPrice <=
                0
            ) {
              throw new SplitInitiationError(
                "This product has no selling price configured. Update the price before selling.",
                400
              );
            }
          }

          // ======================================
          // BRANCH STOCK PRE-CHECK
          // ======================================
          const inventories =
            await tx.inventory.findMany({
              where: {
                productId: {
                  in:
                    productIds,
                },

                locationType:
                  LocationType.BRANCH,

                locationId:
                  branchId,
              },
            });

          const inventoryMap =
            new Map(
              inventories.map(
                (inventory) => [
                  inventory.productId,
                  inventory,
                ]
              )
            );

          for (
            const item of
            items
          ) {
            const product =
              productMap.get(
                item.id
              )!;

            const inventory =
              inventoryMap.get(
                item.id
              );

            const availableQty =
              inventory?.quantity ??
              0;

            if (
              availableQty <
              item.quantity
            ) {
              throw new SplitInitiationError(
                `Not enough stock for ${product.name}. Available: ${availableQty}`,
                409
              );
            }
          }

          // ======================================
          // AUTHORITATIVE PRICING PRODUCTS
          // ======================================
          const pricingProducts:
            DiscountProductInput[] =
            items.map(
              (item) => {
                const product =
                  productMap.get(
                    item.id
                  )!;

                return {
                  productId:
                    product.id,

                  productName:
                    product.name,

                  quantity:
                    item.quantity,

                  retailPrice:
                    product.retailPrice,

                  minimumSellingPrice:
                    product.minimumSellingPrice,

                  costPrice:
                    product.costPrice,
                };
              }
            );

          // ======================================
          // DISCOUNT REQUESTER AUTHORITY
          // ======================================
          let pricingActor:
            DiscountActorInput;

          if (
            discountRequested
          ) {
            pricingActor =
              await resolvePosDiscountActor({
                staffId:
                  session.staffId,

                branchId,

                dependencies: {
                  findStaffById:
                    async (
                      staffId
                    ) =>
                      tx.staff.findUnique({
                        where: {
                          id:
                            staffId,
                        },

                        select: {
                          id:
                            true,

                          name:
                            true,

                          role:
                            true,

                          isActive:
                            true,

                          branchId:
                            true,

                          maxDiscountPercent:
                            true,
                        },
                      }),
                },
              });
          } else {
            /*
             * No discount:
             *
             * preserve the existing Split POS
             * workflow for the authenticated
             * actor.
             */
            pricingActor = {
              id:
                actorId,

              name:
                session.staffName ??
                "POS Staff",

              role:
                session.role ??
                null,

              maxDiscountPercent:
                null,
            };
          }

          // ======================================
          // SHARED PRICING / DISCOUNT ENGINE
          // ======================================
          const pricing =
            await preparePosPricing({
              products:
                pricingProducts,

              actor:
                pricingActor,

              discount,

              approvalDependencies:
                discountRequested
                  ? {
                      findAdminByEmail:
                        async (
                          email
                        ) =>
                          tx.admin.findUnique({
                            where: {
                              email,
                            },

                            select: {
                              id:
                                true,

                              name:
                                true,

                              email:
                                true,

                              pinHash:
                                true,

                              role:
                                true,

                              isActive:
                                true,

                              staff: {
                                select: {
                                  id:
                                    true,

                                  name:
                                    true,

                                  role:
                                    true,

                                  isActive:
                                    true,

                                  maxDiscountPercent:
                                    true,
                                },
                              },
                            },
                          }),
                    }
                  : undefined,
            });

          /*
           * This is now the exact authoritative
           * discounted order total.
           */
          const orderAmountPesewas =
            pricing.finalSubtotalPesewas;

          if (
            !Number.isSafeInteger(
              orderAmountPesewas
            ) ||
            orderAmountPesewas <=
              0
          ) {
            throw new SplitInitiationError(
              "Invalid order amount"
            );
          }

          const orderAmount =
            getLegacyOrderAmount(
              orderAmountPesewas
            );

          // ======================================
          // SPLIT ALLOCATION VALIDATION
          // ======================================
          //
          // Cash is validated against the FINAL
          // discounted total, not retail total.
          // ======================================
          if (
            cashAmountPesewas <=
            0
          ) {
            throw new SplitInitiationError(
              "Cash amount must be greater than zero for a split payment"
            );
          }

          if (
            cashAmountPesewas >=
            orderAmountPesewas
          ) {
            throw new SplitInitiationError(
              "Cash amount must be less than the final order total for a Cash + MoMo split payment"
            );
          }

          const momoAmountPesewas =
            orderAmountPesewas -
            cashAmountPesewas;

          if (
            !Number.isSafeInteger(
              momoAmountPesewas
            ) ||
            momoAmountPesewas <=
              0
          ) {
            throw new SplitInitiationError(
              "Invalid Mobile Money balance"
            );
          }

          const pricingLineMap =
            new Map(
              pricing.lines.map(
                (line) => [
                  line.productId,
                  line,
                ]
              )
            );

          // ======================================
          // CREATE PENDING SPLIT ORDER
          // ======================================
          const order =
            await tx.order.create({
              data: {
                orderId:
                  createOrderId(),

                receiptToken:
                  createReceiptToken(),

                email:
                  "pos@shop.com",

                phone,

                customerName:
                  typeof customerName ===
                    "string" &&
                  customerName.trim()
                    ? customerName.trim()
                    : null,

                paymentMethod:
                  PaymentMethod.SPLIT,

                amount:
                  orderAmount,

                amountPesewas:
                  orderAmountPesewas,

                paymentStatus:
                  "PENDING",

                locationId:
                  branchId,

                orderItems: {
                  create:
                    items.map(
                      (item) => {
                        const product =
                          productMap.get(
                            item.id
                          )!;

                        const pricingLine =
                          pricingLineMap.get(
                            product.id
                          );

                        if (
                          !pricingLine
                        ) {
                          throw new SplitInitiationError(
                            `Pricing result missing for ${product.name}`,
                            500
                          );
                        }

                        return {
                          productId:
                            product.id,

                          quantity:
                            item.quantity,

                          /*
                           * Actual final selling
                           * values.
                           */
                          unitPrice:
                            pricingLine.finalUnitPricePesewas /
                            100,

                          totalPrice:
                            pricingLine.finalTotalPesewas /
                            100,

                          /*
                           * Original retail and
                           * discount audit values.
                           */
                          originalUnitPrice:
                            pricing.discount
                              ? pricingLine.originalUnitPricePesewas /
                                100
                              : null,

                          discountPerUnit:
                            pricingLine.discountPerUnitPesewas /
                            100,

                          originalTotalPrice:
                            pricing.discount
                              ? pricingLine.originalTotalPesewas /
                                100
                              : null,

                          discountTotal:
                            pricingLine.discountTotalPesewas /
                            100,
                        };
                      }
                    ),
                },

                payments: {
                  create: [
                    {
                      method:
                        PaymentMethod.CASH,

                      amountPesewas:
                        cashAmountPesewas,

                      status:
                        OrderPaymentStatus.CONFIRMED,

                      provider:
                        "POS",

                      providerStatus:
                        "confirmed",

                      confirmedAt:
                        new Date(),
                    },

                    {
                      method:
                        PaymentMethod.MOMO,

                      amountPesewas:
                        momoAmountPesewas,

                      status:
                        OrderPaymentStatus.PENDING,

                      provider:
                        "PAYSTACK",

                      providerReference,

                      providerCode:
                        provider,

                      phone,

                      providerStatus:
                        "initiating",
                    },
                  ],
                },
              },

              include: {
                payments:
                  true,
              },
            });

          // ======================================
          // DISCOUNT AUDIT SNAPSHOT
          // ======================================
          if (
            pricing.discount
          ) {
            const audit =
              pricing.discount;

            await tx.orderDiscount.create({
              data: {
                orderId:
                  order.id,

                type:
                  audit.type,

                value:
                  audit.value,

                reason:
                  audit.reason,

                note:
                  audit.note,

                originalSubtotal:
                  audit.originalSubtotalPesewas /
                  100,

                discountAmount:
                  audit.discountAmountPesewas /
                  100,

                finalSubtotal:
                  audit.finalSubtotalPesewas /
                  100,

                requestedById:
                  audit.requestedById,

                requestedByName:
                  audit.requestedByName,

                requestedByRole:
                  audit.requestedByRole,

                approvalRequired:
                  audit.approvalRequired,

                approvedById:
                  audit.approval
                    ?.approvedById ??
                  null,

                approvedByName:
                  audit.approval
                    ?.approvedByName ??
                  null,

                approvedByRole:
                  audit.approval
                    ?.approvedByRole ??
                  null,

                approvedAt:
                  audit.approval
                    ?.approvedAt ??
                  null,
              },
            });
          }

          const momoPayment =
            order.payments.find(
              (payment) =>
                payment.method ===
                  PaymentMethod.MOMO &&
                payment.provider ===
                  "PAYSTACK"
            );

          const cashPayment =
            order.payments.find(
              (payment) =>
                payment.method ===
                  PaymentMethod.CASH
            );

          if (
            !momoPayment ||
            !cashPayment
          ) {
            throw new SplitInitiationError(
              "Unable to prepare split payment",
              500
            );
          }

          // ======================================
          // CONVERT RESUMED HELD SALE
          // ======================================
          //
          // At this point:
          //
          // - the real PENDING Order exists;
          // - the Cash allocation is CONFIRMED;
          // - the MoMo allocation is PENDING.
          //
          // Therefore the generic held-sale
          // workflow must end here. Recovery of
          // any later MoMo problem belongs to the
          // protected split-payment workflow.
          //
          // This runs inside the SAME Prisma
          // transaction as the Order and payment
          // allocations. A duplicate conversion
          // therefore rolls everything back.
          if (heldSaleId) {
            const heldSaleConversion =
              await tx.posHeldSale.updateMany({
                where: {
                  id:
                    heldSaleId,

                  branchId,

                  status:
                    "RESUMED",

                  convertedAt:
                    null,

                  convertedOrderId:
                    null,
                },

                data: {
                  status:
                    "CONVERTED",

                  convertedAt:
                    new Date(),

                  convertedOrderId:
                    order.orderId,
                },
              });

            if (
              heldSaleConversion.count !==
              1
            ) {
              throw new SplitInitiationError(
                "This held sale has already entered another payment workflow. No duplicate split-payment order was created.",
                409
              );
            }
          }

          return {
            order,
            momoPayment,
            cashPayment,

            orderAmountPesewas,

            cashAmountPesewas,

            momoAmountPesewas,

            originalSubtotalPesewas:
              pricing.originalSubtotalPesewas,

            discountAmountPesewas:
              pricing.discountAmountPesewas,
          };
        }
      );

    // ==========================================
    // REQUEST MOMO BALANCE FROM PAYSTACK
    // ==========================================
    //
    // The DB transaction has committed.
    //
    // Cash is already CONFIRMED.
    //
    // Paystack receives ONLY the exact remaining
    // MoMo amount calculated from the stored
    // discounted order total.
    // ==========================================
    let chargeResponse:
      Response;

    try {
      chargeResponse =
        await fetch(
          "https://api.paystack.co/charge",
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${secret}`,

              "Content-Type":
                "application/json",
            },

            cache:
              "no-store",

            body:
              JSON.stringify({
                email:
                  prepared.order
                    .email,

                amount:
                  String(
                    prepared.momoAmountPesewas
                  ),

                currency:
                  "GHS",

                reference:
                  prepared.momoPayment
                    .providerReference,

                mobile_money: {
                  phone,
                  provider,
                },

                metadata: {
                  source:
                    "POS_MOMO",

                  paymentMode:
                    "SPLIT",

                  orderId:
                    prepared.order
                      .orderId,

                  orderPaymentId:
                    prepared.momoPayment
                      .id,

                  branchId,

                  actorId,
                },
              }),
          }
        );
    } catch (networkError) {
      console.error(
        "POS split MoMo Paystack network error:",
        networkError
      );

      /*
       * Do NOT mark the MoMo allocation failed.
       *
       * A network timeout does not prove
       * Paystack did not receive the request.
       *
       * Cash remains CONFIRMED, MoMo remains
       * PENDING, stock remains untouched.
       */
      await prisma.orderPayment.update({
        where: {
          id:
            prepared.momoPayment
              .id,
        },

        data: {
          providerStatus:
            "network_error",
        },
      });

      return NextResponse.json(
        {
          error:
            "Unable to reach Paystack. The Cash payment is recorded. Check the existing MoMo payment status before trying again.",

          orderId:
            prepared.order
              .orderId,

          paymentId:
            prepared.momoPayment
              .id,

          reference:
            prepared.momoPayment
              .providerReference,

          orderAmountPesewas:
            prepared.orderAmountPesewas,

          originalSubtotalPesewas:
            prepared.originalSubtotalPesewas,

          discountAmountPesewas:
            prepared.discountAmountPesewas,

          cashAmountPesewas:
            prepared.cashAmountPesewas,

          momoAmountPesewas:
            prepared.momoAmountPesewas,

          cashPaymentStatus:
            "CONFIRMED",

          momoPaymentStatus:
            "PENDING",

          expiresInSeconds:
            180,
        },
        {
          status: 502,
        }
      );
    }

    let paystackData:
      PaystackChargeResponse;

    try {
      paystackData =
        (await chargeResponse.json()) as
          PaystackChargeResponse;
    } catch {
      /*
       * Paystack was contacted but its response
       * could not be interpreted.
       *
       * Preserve PENDING so the same reference
       * can be verified safely.
       */
      await prisma.orderPayment.update({
        where: {
          id:
            prepared.momoPayment
              .id,
        },

        data: {
          providerStatus:
            "invalid_response",
        },
      });

      return NextResponse.json(
        {
          error:
            "Paystack returned an invalid response. The Cash payment is recorded. Check the existing MoMo payment status before trying again.",

          orderId:
            prepared.order
              .orderId,

          paymentId:
            prepared.momoPayment
              .id,

          reference:
            prepared.momoPayment
              .providerReference,

          orderAmountPesewas:
            prepared.orderAmountPesewas,

          originalSubtotalPesewas:
            prepared.originalSubtotalPesewas,

          discountAmountPesewas:
            prepared.discountAmountPesewas,

          cashAmountPesewas:
            prepared.cashAmountPesewas,

          momoAmountPesewas:
            prepared.momoAmountPesewas,

          cashPaymentStatus:
            "CONFIRMED",

          momoPaymentStatus:
            "PENDING",

          expiresInSeconds:
            180,
        },
        {
          status: 502,
        }
      );
    }

    const returnedReference =
      paystackData.data
        ?.reference ??
      prepared.momoPayment
        .providerReference;

    const providerStatus =
      paystackData.data
        ?.status ??
      (
        chargeResponse.ok
          ? "unknown"
          : "failed"
      );

    // ==========================================
    // DEFINITIVE MOMO INITIATION FAILURE
    // ==========================================
    //
    // Cash remains CONFIRMED.
    // MoMo becomes FAILED.
    // Order remains PENDING.
    // Stock remains untouched.
    //
    // Existing split retry then charges the
    // SAME outstanding balance stored against
    // this discounted order.
    // ==========================================
    if (
      !chargeResponse.ok ||
      paystackData.status !==
        true
    ) {
      await prisma.orderPayment.update({
        where: {
          id:
            prepared.momoPayment
              .id,
        },

        data: {
          status:
            OrderPaymentStatus.FAILED,

          providerReference:
            returnedReference,

          providerStatus,
        },
      });

      return NextResponse.json(
        {
          error:
            paystackData.message ||
            "Paystack could not start the Mobile Money part of the split payment",

          details:
            paystackData.data
              ?.message ??
            null,

          orderId:
            prepared.order
              .orderId,

          paymentId:
            prepared.momoPayment
              .id,

          reference:
            returnedReference,

          orderAmountPesewas:
            prepared.orderAmountPesewas,

          originalSubtotalPesewas:
            prepared.originalSubtotalPesewas,

          discountAmountPesewas:
            prepared.discountAmountPesewas,

          cashAmountPesewas:
            prepared.cashAmountPesewas,

          momoAmountPesewas:
            prepared.momoAmountPesewas,

          cashPaymentStatus:
            "CONFIRMED",

          momoPaymentStatus:
            "FAILED",

          orderFinalized:
            false,
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // PAYSTACK REQUEST ACCEPTED
    // ==========================================
    await prisma.orderPayment.update({
      where: {
        id:
          prepared.momoPayment
            .id,
      },

      data: {
        providerReference:
          returnedReference,

        providerStatus,
      },
    });

    return NextResponse.json({
      success:
        true,

      orderId:
        prepared.order
          .orderId,

      paymentId:
        prepared.momoPayment
          .id,

      reference:
        returnedReference,

      paymentStatus:
        "PENDING",

      providerStatus,

      paymentMethod:
        "SPLIT",

      orderAmountPesewas:
        prepared.orderAmountPesewas,

      originalSubtotalPesewas:
        prepared.originalSubtotalPesewas,

      discountAmountPesewas:
        prepared.discountAmountPesewas,

      cashAmountPesewas:
        prepared.cashAmountPesewas,

      momoAmountPesewas:
        prepared.momoAmountPesewas,

      cashPaymentStatus:
        "CONFIRMED",

      momoPaymentStatus:
        "PENDING",

      displayText:
        paystackData.data
          ?.display_text ??
        "Please approve the Mobile Money balance on the customer's phone.",

      expiresInSeconds:
        180,
    });
  } catch (error) {
    console.error(
      "POS split payment initiation error:",
      error
    );

    if (
      error instanceof
      SplitInitiationError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.status,
        }
      );
    }

    if (
      error instanceof
      PosPricingPreparationError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.statusCode,
        }
      );
    }

    if (
      error instanceof
      PosDiscountActorError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.statusCode,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to start split payment",
      },
      {
        status: 500,
      }
    );
  }
}