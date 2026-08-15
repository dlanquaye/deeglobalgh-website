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
      (quantitiesByProduct.get(
        id
      ) ?? 0) + quantity
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
 * Convert a cashier-entered GHS amount
 * to exact integer pesewas without doing
 * financial reconciliation in floating
 * point arithmetic.
 *
 * Accepted examples:
 *   40
 *   40.5
 *   40.50
 */
function parseGhsToPesewas(
  value: unknown
) {
  const text =
    typeof value === "number"
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
    } = body;

    const items =
      normaliseItems(
        rawItems
      );

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

    const providerReference =
      createPaystackReference();

    // ==========================================
    // PREPARE SPLIT ORDER
    // ==========================================
    //
    // IMPORTANT:
    //
    // Cash is recorded as CONFIRMED.
    //
    // MoMo remains PENDING.
    //
    // Stock is NOT reduced here.
    // ==========================================
    const prepared =
      await prisma.$transaction(
        async (tx) => {
          const productIds =
            items.map(
              (item) =>
                item.id
            );

          const products =
            await tx.product.findMany({
              where: {
                id: {
                  in: productIds,
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

          const inventories =
            await tx.inventory.findMany({
              where: {
                productId: {
                  in: productIds,
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

          /*
           * Confirm sufficient branch stock
           * before accepting the split payment.
           *
           * This is a pre-check only.
           * Final atomic protection remains in
           * applyStockMovement() after the MoMo
           * allocation is confirmed.
           */
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

          /*
           * Calculate the authoritative order
           * total directly in integer pesewas.
           *
           * Never round the completed basket to
           * a whole cedi before allocating Cash
           * and Mobile Money.
           */
          let orderAmountPesewas =
            0;

          for (
            const item of
            items
          ) {
            const product =
              productMap.get(
                item.id
              )!;

            const unitPricePesewas =
              Math.round(
                product.retailPrice *
                100
              );

            if (
              !Number.isSafeInteger(
                unitPricePesewas
              ) ||
              unitPricePesewas <=
                0
            ) {
              throw new SplitInitiationError(
                `Invalid selling price for ${product.name}`,
                400
              );
            }

            const lineTotalPesewas =
              unitPricePesewas *
              item.quantity;

            if (
              !Number.isSafeInteger(
                lineTotalPesewas
              ) ||
              lineTotalPesewas <=
                0
            ) {
              throw new SplitInitiationError(
                `Invalid order total for ${product.name}`,
                400
              );
            }

            orderAmountPesewas +=
              lineTotalPesewas;

            if (
              !Number.isSafeInteger(
                orderAmountPesewas
              )
            ) {
              throw new SplitInitiationError(
                "Order amount is too large",
                400
              );
            }
          }

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

          /*
           * amountPesewas is authoritative for
           * new POS orders.
           *
           * Order.amount remains populated only
           * for backwards compatibility with
           * existing parts of the application.
           */
          const orderAmount =
            getLegacyOrderAmount(
              orderAmountPesewas
            );

          /*
           * A genuine split must contain
           * BOTH payment methods.
           *
           * Cash = 0 is pure MoMo.
           * Cash = total is pure Cash.
           *
           * Those belong to the existing
           * single-method checkout paths.
           */
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
              "Cash amount must be less than the order total for a Cash + MoMo split payment"
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
                      (
                        item
                      ) => {
                        const product =
                          productMap.get(
                            item.id
                          )!;

                        return {
                          productId:
                            product.id,

                          quantity:
                            item.quantity,

                          unitPrice:
                            product.retailPrice,

                          totalPrice:
                            product.retailPrice *
                            item.quantity,
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

          return {
            order,
            momoPayment,
            cashPayment,
            orderAmountPesewas,
            cashAmountPesewas,
            momoAmountPesewas,
          };
        }
      );

    // ==========================================
    // REQUEST THE MOMO BALANCE FROM PAYSTACK
    // ==========================================
    //
    // The DB transaction has already committed.
    //
    // This means we never hold a database
    // transaction open across an external
    // Paystack network call.
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
       * A timeout does not prove Paystack did
       * not receive the charge request.
       *
       * Cash remains CONFIRMED, MoMo remains
       * PENDING, and stock remains untouched.
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

          cashAmountPesewas:
            prepared.cashAmountPesewas,

          momoAmountPesewas:
            prepared.momoAmountPesewas,
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
       * The request reached Paystack, but the
       * response could not be interpreted.
       *
       * Preserve the pending allocation so the
       * reference can be checked safely.
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

          cashAmountPesewas:
            prepared.cashAmountPesewas,

          momoAmountPesewas:
            prepared.momoAmountPesewas,
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
      (chargeResponse.ok
        ? "unknown"
        : "failed");

    /*
     * Definitive initiation failure:
     *
     * Cash remains CONFIRMED.
     * MoMo becomes FAILED.
     * Order remains PENDING.
     * Stock remains untouched.
     *
     * This allows a replacement MoMo
     * allocation to be added later without
     * destroying the recorded Cash payment.
     */
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

      cashAmountPesewas:
        prepared.cashAmountPesewas,

      momoAmountPesewas:
        prepared.momoAmountPesewas,

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