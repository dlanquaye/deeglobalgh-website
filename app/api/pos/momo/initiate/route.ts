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

class MomoInitiationError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);

    this.name =
      "MomoInitiationError";

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
    throw new MomoInitiationError(
      "No items provided"
    );
  }

  const quantitiesByProduct =
    new Map<string, number>();

  for (const item of items) {
    if (
      !item ||
      typeof item !==
        "object" ||
      !("id" in item) ||
      !("quantity" in item)
    ) {
      throw new MomoInitiationError(
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
      throw new MomoInitiationError(
        "Invalid product"
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      throw new MomoInitiationError(
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
    throw new MomoInitiationError(
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

  throw new MomoInitiationError(
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
    throw new MomoInitiationError(
      "Customer Mobile Money number is required"
    );
  }

  let phone =
    value
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "");

  if (
    phone.startsWith("+233")
  ) {
    phone =
      "0" +
      phone.substring(4);
  } else if (
    phone.startsWith("233")
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
    throw new MomoInitiationError(
      "Enter a valid Ghana Mobile Money number"
    );
  }

  return phone;
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
    `POSMOMO-${Date.now()}-` +
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

    const branchId =
      session.branchId;

    const heldSaleId =
      typeof rawHeldSaleId ===
        "string"
        ? rawHeldSaleId.trim()
        : "";

    /*
     * The provider reference belongs to the
     * individual OrderPayment allocation.
     */
    const providerReference =
      createPaystackReference();

    // ==========================================
    // PREPARE ORDER
    // ==========================================
    //
    // IMPORTANT:
    //
    // 1. Products and pricing are fetched on
    //    the server.
    //
    // 2. Discount authority is resolved on
    //    the server.
    //
    // 3. The discounted order and immutable
    //    audit snapshot are committed BEFORE
    //    Paystack is contacted.
    //
    // 4. Stock is NOT reduced here.
    //
    // 5. Stock is reduced only after Paystack
    //    independently confirms payment.
    // ==========================================
    const prepared =
      await prisma.$transaction(
        async (tx) => {
          // ======================================
          // OPTIONAL RESUMED HELD-SALE GUARD
          // ======================================
          //
          // If this MoMo payment originates from
          // a resumed held basket, the held record
          // must still be available before ANY real
          // Order or OrderPayment is created.
          //
          // Normal POS MoMo sales omit heldSaleId
          // and continue exactly as before.
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
              throw new MomoInitiationError(
                "This held sale is no longer available for Mobile Money payment. Refresh the held-sales list before continuing.",
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
              throw new MomoInitiationError(
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
              throw new MomoInitiationError(
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
              throw new MomoInitiationError(
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
             * preserve the existing POS ability
             * to prepare a normal MoMo order
             * using the authenticated actor.
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

          const amountPesewas =
            pricing.finalSubtotalPesewas;

          if (
            !Number.isSafeInteger(
              amountPesewas
            ) ||
            amountPesewas <=
              0
          ) {
            throw new MomoInitiationError(
              "Invalid payment amount",
              400
            );
          }

          /*
           * amountPesewas is authoritative.
           *
           * Order.amount is retained only for
           * backwards compatibility.
           */
          const orderAmount =
            getLegacyOrderAmount(
              amountPesewas
            );

          const pricingLineMap =
            new Map(
              pricing.lines.map(
                (line) => [
                  line.productId,
                  line,
                ]
              )
            );

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
                  PaymentMethod.MOMO,

                amount:
                  orderAmount,

                amountPesewas,

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
                          throw new MomoInitiationError(
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
                  create: {
                    method:
                      PaymentMethod.MOMO,

                    amountPesewas,

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

          const payment =
            order.payments[0];

          if (!payment) {
            throw new MomoInitiationError(
              "Unable to prepare Mobile Money payment",
              500
            );
          }

          // ======================================
          // CONVERT RESUMED HELD SALE
          // ======================================
          //
          // The real PENDING Order and PENDING
          // OrderPayment now exist.
          //
          // From this point onward the payment
          // recovery workflow is authoritative.
          // The basket must therefore no longer
          // remain resumable as a generic held sale.
          //
          // This update is inside the SAME Prisma
          // transaction as Order/Payment creation.
          //
          // If another request already converted
          // the held sale, throwing here rolls back
          // this newly-created Order and Payment.
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
              throw new MomoInitiationError(
                "This held sale has already entered another payment workflow. No duplicate Mobile Money order was created.",
                409
              );
            }
          }

          return {
            order,
            payment,
            amountPesewas,

            originalSubtotalPesewas:
              pricing.originalSubtotalPesewas,

            discountAmountPesewas:
              pricing.discountAmountPesewas,
          };
        }
      );

    // ==========================================
    // REQUEST PAYMENT FROM PAYSTACK
    // ==========================================
    //
    // The database transaction has committed
    // before this external network call.
    //
    // Therefore Paystack always receives the
    // exact amount stored on the PENDING order.
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
                    prepared.amountPesewas
                  ),

                currency:
                  "GHS",

                reference:
                  prepared.payment
                    .providerReference,

                mobile_money: {
                  phone,
                  provider,
                },

                metadata: {
                  source:
                    "POS_MOMO",

                  orderId:
                    prepared.order
                      .orderId,

                  orderPaymentId:
                    prepared.payment
                      .id,

                  branchId,

                  actorId,
                },
              }),
          }
        );
    } catch (networkError) {
      console.error(
        "POS MoMo Paystack network error:",
        networkError
      );

      /*
       * Leave payment PENDING.
       *
       * A network timeout does not prove
       * Paystack failed to receive the request.
       */
      await prisma.orderPayment.update({
        where: {
          id:
            prepared.payment.id,
        },

        data: {
          providerStatus:
            "network_error",
        },
      });

      return NextResponse.json(
        {
          error:
            "Unable to reach Paystack. Check the payment status before trying again.",

          orderId:
            prepared.order
              .orderId,

          paymentId:
            prepared.payment
              .id,

          reference:
            prepared.payment
              .providerReference,

          orderAmountPesewas:
            prepared.amountPesewas,

          originalSubtotalPesewas:
            prepared.originalSubtotalPesewas,

          discountAmountPesewas:
            prepared.discountAmountPesewas,

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
       * Paystack was contacted but the response
       * was not parseable.
       *
       * Preserve PENDING because the reference
       * must be checked before another charge.
       */
      await prisma.orderPayment.update({
        where: {
          id:
            prepared.payment.id,
        },

        data: {
          providerStatus:
            "invalid_response",
        },
      });

      return NextResponse.json(
        {
          error:
            "Paystack returned an invalid response. Check this existing Mobile Money payment before trying again.",

          orderId:
            prepared.order
              .orderId,

          paymentId:
            prepared.payment
              .id,

          reference:
            prepared.payment
              .providerReference,

          orderAmountPesewas:
            prepared.amountPesewas,

          originalSubtotalPesewas:
            prepared.originalSubtotalPesewas,

          discountAmountPesewas:
            prepared.discountAmountPesewas,

          paymentStatus:
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
      prepared.payment
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
    // DEFINITIVE INITIATION FAILURE
    // ==========================================
    if (
      !chargeResponse.ok ||
      paystackData.status !==
        true
    ) {
      await prisma.$transaction(
        async (tx) => {
          await tx.orderPayment.update({
            where: {
              id:
                prepared.payment.id,
            },

            data: {
              status:
                OrderPaymentStatus.FAILED,

              providerReference:
                returnedReference,

              providerStatus,
            },
          });

          await tx.order.update({
            where: {
              id:
                prepared.order.id,
            },

            data: {
              paymentStatus:
                "FAILED",
            },
          });
        }
      );

      return NextResponse.json(
        {
          error:
            paystackData.message ||
            "Paystack could not start the Mobile Money payment",

          details:
            paystackData.data
              ?.message ??
            null,

          orderId:
            prepared.order
              .orderId,

          orderAmountPesewas:
            prepared.amountPesewas,

          originalSubtotalPesewas:
            prepared.originalSubtotalPesewas,

          discountAmountPesewas:
            prepared.discountAmountPesewas,
        },
        {
          status: 400,
        }
      );
    }

    await prisma.orderPayment.update({
      where: {
        id:
          prepared.payment.id,
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
        prepared.payment.id,

      reference:
        returnedReference,

      paymentStatus:
        "PENDING",

      providerStatus,

      paymentMethod:
        "MOMO",

      orderAmountPesewas:
        prepared.amountPesewas,

      originalSubtotalPesewas:
        prepared.originalSubtotalPesewas,

      discountAmountPesewas:
        prepared.discountAmountPesewas,

      displayText:
        paystackData.data
          ?.display_text ??
        "Please approve the Mobile Money payment on the customer's phone.",

      expiresInSeconds:
        180,
    });
  } catch (error) {
    console.error(
      "POS MoMo initiation error:",
      error
    );

    if (
      error instanceof
      MomoInitiationError
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
          "Unable to start Mobile Money payment",
      },
      {
        status: 500,
      }
    );
  }
}