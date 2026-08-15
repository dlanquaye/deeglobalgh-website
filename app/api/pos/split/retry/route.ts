export const runtime = "nodejs";

import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  LocationType,
  OrderPaymentStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  getRequiredOrderAmountPesewas,
} from "@/lib/pos/orderMoney";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

type MomoProvider =
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

type ErrorDetails = Record<
  string,
  unknown
>;

class SplitRetryError extends Error {
  status: number;
  details?: ErrorDetails;

  constructor(
    message: string,
    status = 400,
    details?: ErrorDetails
  ) {
    super(message);

    this.name =
      "SplitRetryError";

    this.status =
      status;

    this.details =
      details;
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

function getRequiredString(
  value: unknown,
  label: string
) {
  if (
    typeof value !==
    "string" ||
    !value.trim()
  ) {
    throw new SplitRetryError(
      `${label} is required`
    );
  }

  return value.trim();
}

function normaliseProvider(
  value: unknown
): MomoProvider {
  if (
    value === "mtn" ||
    value === "atl" ||
    value === "vod"
  ) {
    return value;
  }

  throw new SplitRetryError(
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
    throw new SplitRetryError(
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
    throw new SplitRetryError(
      "Enter a valid Ghana Mobile Money number"
    );
  }

  return phone;
}

function createPaystackReference() {
  return (
    `POSSPLIT-${Date.now()}-` +
    randomBytes(6).toString(
      "hex"
    )
  );
}

function isRetryablePrismaError(
  error: unknown
) {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

async function runSerializable<T>(
  operation: (
    tx: Prisma.TransactionClient
  ) => Promise<T>
): Promise<T> {
  const maxAttempts = 3;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      return await prisma.$transaction(
        operation,
        {
          isolationLevel:
            "Serializable",
        }
      );
    } catch (error) {
      if (
        !isRetryablePrismaError(
          error
        ) ||
        attempt === maxAttempts
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    "Unable to prepare replacement Mobile Money payment"
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

    const orderId =
      getRequiredString(
        body.orderId,
        "Order ID"
      );

    const provider =
      normaliseProvider(
        body.provider
      );

    const requestedPhone =
      body.customerPhone;

    const branchId =
      session.branchId;

    const providerReference =
      createPaystackReference();

    // ==========================================
    // PREPARE REPLACEMENT MOMO ALLOCATION
    // ==========================================
    //
    // Important:
    //
    // - Existing CONFIRMED Cash remains intact.
    // - Existing FAILED MoMo remains intact for
    //   audit history.
    // - A new PENDING MoMo allocation is created
    //   only for the unpaid balance.
    // - Stock is NOT touched here.
    // ==========================================
    const prepared =
      await runSerializable(
        async (tx) => {
          const order =
            await tx.order.findUnique({
              where: {
                orderId,
              },

              include: {
                payments:
                  true,

                orderItems: {
                  include: {
                    product:
                      true,
                  },
                },
              },
            });

          if (!order) {
            throw new SplitRetryError(
              "Split-payment order not found",
              404
            );
          }

          if (
            order.locationId !==
            branchId
          ) {
            throw new SplitRetryError(
              "This split-payment order belongs to another branch",
              403
            );
          }

          if (
            order.paymentMethod !==
            PaymentMethod.SPLIT
          ) {
            throw new SplitRetryError(
              "This order is not a split-payment order"
            );
          }

          if (
            order.paymentStatus !==
            PaymentStatus.PENDING
          ) {
            throw new SplitRetryError(
              "This order is no longer awaiting payment",
              409
            );
          }

          if (
            order.stockReduced
          ) {
            throw new SplitRetryError(
              "Stock has already been reduced for this order",
              409
            );
          }

          /*
           * New POS orders use the exact
           * Order.amountPesewas value.
           *
           * Historical orders that pre-date
           * the field safely fall back to
           * Order.amount * 100.
           */
          let requiredAmountPesewas:
            number;

          try {
            requiredAmountPesewas =
              getRequiredOrderAmountPesewas(
                order
              );
          } catch {
            throw new SplitRetryError(
              "The order has an invalid amount",
              409
            );
          }

          // ======================================
          // CONFIRMED PAYMENT TOTAL
          // ======================================
          const confirmedPayments =
            order.payments.filter(
              (payment) =>
                payment.status ===
                OrderPaymentStatus.CONFIRMED
            );

          const confirmedAmountPesewas =
            confirmedPayments.reduce(
              (
                sum,
                payment
              ) =>
                sum +
                payment.amountPesewas,
              0
            );

          const confirmedCashAmountPesewas =
            confirmedPayments
              .filter(
                (payment) =>
                  payment.method ===
                  PaymentMethod.CASH
              )
              .reduce(
                (
                  sum,
                  payment
                ) =>
                  sum +
                  payment.amountPesewas,
                0
              );

          /*
           * A retry is valid only when the
           * confirmed allocation is the Cash
           * portion of the split.
           *
           * If another method is already
           * confirmed, do not guess how to
           * reconcile it.
           */
          if (
            confirmedCashAmountPesewas <=
            0
          ) {
            throw new SplitRetryError(
              "No confirmed Cash allocation was found for this split payment",
              409
            );
          }

          if (
            confirmedAmountPesewas !==
            confirmedCashAmountPesewas
          ) {
            throw new SplitRetryError(
              "This split payment already contains another confirmed payment allocation and requires review",
              409
            );
          }

          if (
            confirmedAmountPesewas >=
            requiredAmountPesewas
          ) {
            throw new SplitRetryError(
              "The order already has enough confirmed payment and should not be charged again",
              409
            );
          }

          // ======================================
          // DO NOT DUPLICATE A PENDING MOMO
          // ======================================
          const existingPendingMomo =
            order.payments.find(
              (payment) =>
                payment.method ===
                  PaymentMethod.MOMO &&
                payment.provider ===
                  "PAYSTACK" &&
                payment.status ===
                  OrderPaymentStatus.PENDING
            );

          if (
            existingPendingMomo
          ) {
            throw new SplitRetryError(
              "A Mobile Money payment is still pending for this split order. Check that payment before trying again.",
              409,
              {
                orderId:
                  order.orderId,

                paymentId:
                  existingPendingMomo.id,

                reference:
                  existingPendingMomo.providerReference,

                existingPayment:
                  true,

                paymentStatus:
                  "PENDING",
              }
            );
          }

          // ======================================
          // REQUIRE A PREVIOUS FAILED MOMO
          // ======================================
          const failedMomo =
            order.payments.find(
              (payment) =>
                payment.method ===
                  PaymentMethod.MOMO &&
                payment.provider ===
                  "PAYSTACK" &&
                payment.status ===
                  OrderPaymentStatus.FAILED
            );

          if (!failedMomo) {
            throw new SplitRetryError(
              "No failed Mobile Money allocation is available to retry for this split order",
              409
            );
          }

          const remainingAmountPesewas =
            requiredAmountPesewas -
            confirmedAmountPesewas;

          if (
            !Number.isInteger(
              remainingAmountPesewas
            ) ||
            remainingAmountPesewas <=
            0
          ) {
            throw new SplitRetryError(
              "There is no valid unpaid Mobile Money balance for this order",
              409
            );
          }

          // ======================================
          // RECHECK BRANCH STOCK
          // ======================================
          //
          // The original split payment may have
          // been waiting while another sale was
          // completed.
          //
          // Recheck stock before asking the
          // customer to approve another charge.
          //
          // Final atomic stock protection still
          // happens in the shared finaliser.
          // ======================================
          const requiredByProduct =
            new Map<
              string,
              number
            >();

          for (
            const item of
            order.orderItems
          ) {
            requiredByProduct.set(
              item.productId,
              (
                requiredByProduct.get(
                  item.productId
                ) ?? 0
              ) +
                item.quantity
            );
          }

          const productIds =
            Array.from(
              requiredByProduct.keys()
            );

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

          const inventoryByProduct =
            new Map(
              inventories.map(
                (inventory) => [
                  inventory.productId,
                  inventory,
                ]
              )
            );

          for (
            const [
              productId,
              requiredQty,
            ] of requiredByProduct
          ) {
            const orderItem =
              order.orderItems.find(
                (item) =>
                  item.productId ===
                  productId
              );

            const inventory =
              inventoryByProduct.get(
                productId
              );

            const availableQty =
              inventory?.quantity ??
              0;

            if (
              availableQty <
              requiredQty
            ) {
              throw new SplitRetryError(
                `Not enough stock for ${
                  orderItem?.product
                    .name ??
                  "one of the products"
                }. Available: ${availableQty}`,
                409
              );
            }
          }

          // ======================================
          // PHONE
          // ======================================
          //
          // If the cashier supplies a corrected
          // number use it. Otherwise reuse the
          // number already stored on the split
          // order.
          // ======================================
          const phone =
            normaliseGhanaPhone(
              typeof requestedPhone ===
                  "string" &&
                requestedPhone.trim()
                ? requestedPhone
                : order.phone
            );

          if (
            phone !==
            order.phone
          ) {
            await tx.order.update({
              where: {
                id:
                  order.id,
              },

              data: {
                phone,
              },
            });
          }

          // ======================================
          // CREATE REPLACEMENT MOMO ALLOCATION
          // ======================================
          const payment =
            await tx.orderPayment.create({
              data: {
                orderId:
                  order.id,

                method:
                  PaymentMethod.MOMO,

                amountPesewas:
                  remainingAmountPesewas,

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
            });

          return {
            orderId:
              order.orderId,

            orderEmail:
              order.email,

            paymentId:
              payment.id,

            providerReference:
              payment.providerReference!,

            phone,

            requiredAmountPesewas,

            confirmedAmountPesewas,

            cashAmountPesewas:
              confirmedCashAmountPesewas,

            momoAmountPesewas:
              remainingAmountPesewas,
          };
        }
      );

    // ==========================================
    // REQUEST REPLACEMENT MOMO FROM PAYSTACK
    // ==========================================
    //
    // Database transaction is already committed.
    // Never keep a DB transaction open while
    // waiting for Paystack.
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
                  prepared.orderEmail,

                amount:
                  String(
                    prepared.momoAmountPesewas
                  ),

                currency:
                  "GHS",

                reference:
                  prepared.providerReference,

                mobile_money: {
                  phone:
                    prepared.phone,

                  provider,
                },

                metadata: {
                  source:
                    "POS_MOMO",

                  paymentMode:
                    "SPLIT_RETRY",

                  orderId:
                    prepared.orderId,

                  orderPaymentId:
                    prepared.paymentId,

                  branchId,

                  actorId,
                },
              }),
          }
        );
    } catch (networkError) {
      console.error(
        "POS split retry Paystack network error:",
        networkError
      );

      /*
       * A timeout does not prove that Paystack
       * failed to receive the charge request.
       *
       * Keep this replacement payment PENDING
       * so the SAME reference can be checked.
       */
      await prisma.orderPayment.update({
        where: {
          id:
            prepared.paymentId,
        },

        data: {
          providerStatus:
            "network_error",
        },
      });

      return NextResponse.json(
        {
          error:
            "Unable to reach Paystack. Do not create another retry yet. Check this existing Mobile Money payment first.",

          orderId:
            prepared.orderId,

          paymentId:
            prepared.paymentId,

          reference:
            prepared.providerReference,

          orderAmountPesewas:
            prepared.requiredAmountPesewas,

          confirmedAmountPesewas:
            prepared.confirmedAmountPesewas,

          cashAmountPesewas:
            prepared.cashAmountPesewas,

          momoAmountPesewas:
            prepared.momoAmountPesewas,

          paymentStatus:
            "PENDING",

          orderFinalized:
            false,
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
      await prisma.orderPayment.update({
        where: {
          id:
            prepared.paymentId,
        },

        data: {
          providerStatus:
            "invalid_response",
        },
      });

      return NextResponse.json(
        {
          error:
            "Paystack returned an invalid response. Do not create another retry yet. Check this existing Mobile Money payment first.",

          orderId:
            prepared.orderId,

          paymentId:
            prepared.paymentId,

          reference:
            prepared.providerReference,

          orderAmountPesewas:
            prepared.requiredAmountPesewas,

          confirmedAmountPesewas:
            prepared.confirmedAmountPesewas,

          cashAmountPesewas:
            prepared.cashAmountPesewas,

          momoAmountPesewas:
            prepared.momoAmountPesewas,

          paymentStatus:
            "PENDING",

          orderFinalized:
            false,
        },
        {
          status: 502,
        }
      );
    }

    const returnedReference =
      paystackData.data
        ?.reference ??
      prepared.providerReference;

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
    //
    // Only the replacement MoMo allocation is
    // failed.
    //
    // The original Cash payment remains
    // CONFIRMED and the order remains PENDING.
    // ==========================================
    if (
      !chargeResponse.ok ||
      paystackData.status !==
        true
    ) {
      await prisma.orderPayment.update({
        where: {
          id:
            prepared.paymentId,
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
            "Paystack could not start the replacement Mobile Money payment",

          details:
            paystackData.data
              ?.message ??
            null,

          orderId:
            prepared.orderId,

          paymentId:
            prepared.paymentId,

          reference:
            returnedReference,

          orderAmountPesewas:
            prepared.requiredAmountPesewas,

          confirmedAmountPesewas:
            prepared.confirmedAmountPesewas,

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
          prepared.paymentId,
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
        prepared.orderId,

      paymentId:
        prepared.paymentId,

      reference:
        returnedReference,

      paymentStatus:
        "PENDING",

      providerStatus,

      paymentMethod:
        "SPLIT",

      orderAmountPesewas:
        prepared.requiredAmountPesewas,

      confirmedAmountPesewas:
        prepared.confirmedAmountPesewas,

      cashAmountPesewas:
        prepared.cashAmountPesewas,

      momoAmountPesewas:
        prepared.momoAmountPesewas,

      displayText:
        paystackData.data
          ?.display_text ??
        "Please approve the remaining Mobile Money balance on the customer's phone.",

      expiresInSeconds:
        180,
    });
  } catch (error) {
    console.error(
      "POS split payment retry error:",
      error
    );

    if (
      error instanceof
      SplitRetryError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,

          ...(error.details ??
            {}),
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
          "Unable to retry split Mobile Money payment",
      },
      {
        status: 500,
      }
    );
  }
}