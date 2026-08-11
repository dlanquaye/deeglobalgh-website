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
    this.status = status;
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
      typeof item !== "object" ||
      !("id" in item) ||
      !("quantity" in item)
    ) {
      throw new MomoInitiationError(
        "Invalid checkout item"
      );
    }

    const id = String(
      item.id
    );

    const quantity = Number(
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
    randomBytes(3).toString(
      "hex"
    )
  );
}

function createReceiptToken() {
  return randomBytes(
    24
  ).toString("base64url");
}

function createPaystackReference() {
  return (
    `POSMOMO-${Date.now()}-` +
    randomBytes(6).toString(
      "hex"
    )
  );
}

export async function POST(
  req: Request
) {
  try {
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

    const body =
      await req.json();

    const {
      items: rawItems,
      customerName,
      customerPhone,
      provider:
        rawProvider,
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

    const branchId =
      session.branchId;

    /*
     * This reference belongs to the
     * individual payment allocation,
     * not to the Order itself.
     */
    const providerReference =
      createPaystackReference();

    /*
     * Prepare the POS order without
     * reducing stock.
     *
     * Stock is only reduced after
     * Paystack independently confirms
     * successful payment.
     */
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
                isActive: true,
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

          for (const item of items) {
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

          /*
           * Preserve the same selling-price
           * protection as normal POS checkout.
           */
          for (const item of items) {
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
           * Confirm enough branch stock exists
           * before asking the customer to pay.
           *
           * No stock mutation occurs here.
           */
          for (const item of items) {
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

          let total = 0;

          for (const item of items) {
            const product =
              productMap.get(
                item.id
              )!;

            total +=
              product.retailPrice *
              item.quantity;
          }

          /*
           * Preserve the current Order.amount
           * architecture: whole GHS stored in
           * Order.amount.
           */
          const orderAmount =
            Math.round(total);

          const amountPesewas =
            orderAmount * 100;

          if (
            amountPesewas <=
            0
          ) {
            throw new MomoInitiationError(
              "Invalid payment amount",
              400
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
                  "MOMO",

                amount:
                  orderAmount,

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
                payments: true,
              },
            });

          const payment =
            order.payments[0];

          if (!payment) {
            throw new MomoInitiationError(
              "Unable to prepare Mobile Money payment",
              500
            );
          }

          return {
            order,
            payment,
            amountPesewas,
          };
        }
      );

    /*
     * The database transaction above has
     * committed before contacting Paystack.
     *
     * This avoids holding a database
     * transaction open during a network call.
     */
    let chargeResponse: Response;

    try {
      chargeResponse =
        await fetch(
          "https://api.paystack.co/charge",
          {
            method: "POST",

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
       * Leave the payment PENDING.
       *
       * A network timeout does not prove
       * Paystack failed to receive the
       * request. The reference can later
       * be verified safely.
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
        },
        {
          status: 502,
        }
      );
    }

    const paystackData =
      (await chargeResponse.json()) as PaystackChargeResponse;

    const returnedReference =
      paystackData.data
        ?.reference ??
      prepared.payment
        .providerReference;

    const providerStatus =
      paystackData.data
        ?.status ??
      (chargeResponse.ok
        ? "unknown"
        : "failed");

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
      success: true,

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