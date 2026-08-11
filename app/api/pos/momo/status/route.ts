export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { OrderPaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { finalizePosMomoPayment } from "@/lib/pos/finalizePosMomoPayment";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

type PaystackMetadata = {
  source?: unknown;
  orderId?: unknown;
  orderPaymentId?: unknown;
  branchId?: unknown;
  actorId?: unknown;
};

type PaystackVerifyResponse = {
  status?: boolean;
  message?: string;

  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    channel?: string;
    message?: string | null;
    gateway_response?: string | null;
    metadata?: unknown;
  };
};

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

function getString(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed
    ? trimmed
    : null;
}

function parseMetadata(
  value: unknown
): PaystackMetadata | null {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as PaystackMetadata;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    try {
      const parsed =
        JSON.parse(value);

      if (
        parsed &&
        typeof parsed ===
          "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed as PaystackMetadata;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function isTerminalFailure(
  providerStatus: string
) {
  return (
    providerStatus ===
      "failed" ||
    providerStatus ===
      "abandoned" ||
    providerStatus ===
      "reversed"
  );
}

export async function GET(
  req: NextRequest
) {
  try {
    /*
     * ==========================================
     * AUTHENTICATION
     * ==========================================
     */
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

    /*
     * ==========================================
     * IDENTIFY PAYMENT
     * ==========================================
     *
     * Require BOTH values returned by the
     * initiation endpoint.
     */
    const paymentId =
      getString(
        req.nextUrl.searchParams.get(
          "paymentId"
        )
      );

    const reference =
      getString(
        req.nextUrl.searchParams.get(
          "reference"
        )
      );

    if (
      !paymentId ||
      !reference
    ) {
      return NextResponse.json(
        {
          error:
            "Payment ID and Paystack reference are required",
        },
        {
          status: 400,
        }
      );
    }

    const payment =
      await prisma.orderPayment.findUnique({
        where: {
          id:
            paymentId,
        },

        include: {
          order: true,
        },
      });

    if (!payment) {
      return NextResponse.json(
        {
          error:
            "Payment not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Do not allow a cashier session from one
     * branch to inspect another branch's POS
     * payment.
     */
    if (
      payment.order.locationId !==
      session.branchId
    ) {
      return NextResponse.json(
        {
          error:
            "Payment does not belong to this branch",
        },
        {
          status: 403,
        }
      );
    }

    if (
      payment.provider !==
      "PAYSTACK"
    ) {
      return NextResponse.json(
        {
          error:
            "Payment is not a Paystack payment",
        },
        {
          status: 400,
        }
      );
    }

    if (
      payment.method !==
      "MOMO"
    ) {
      return NextResponse.json(
        {
          error:
            "Payment is not Mobile Money",
        },
        {
          status: 400,
        }
      );
    }

    if (
      payment.providerReference !==
      reference
    ) {
      return NextResponse.json(
        {
          error:
            "Payment reference does not match",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * FAST PATH
     * ==========================================
     *
     * If webhook processing already completed
     * everything, do not make another Paystack
     * API request.
     */
    if (
      payment.status ===
        OrderPaymentStatus.CONFIRMED &&
      payment.order.paymentStatus ===
        "PAID" &&
      payment.order.stockReduced
    ) {
      return NextResponse.json({
        success: true,

        orderId:
          payment.order.orderId,

        paymentId:
          payment.id,

        reference,

        paymentStatus:
          "CONFIRMED",

        providerStatus:
          payment.providerStatus ??
          "success",

        orderStatus:
          payment.order
            .paymentStatus,

        orderFinalized:
          true,

        alreadyFinalized:
          true,

        requiresAttention:
          false,

        message:
          "Payment confirmed and sale completed.",
      });
    }

    /*
     * ==========================================
     * PAYSTACK SERVER-SIDE VERIFICATION
     * ==========================================
     */
    let verifyResponse: Response;

    try {
      verifyResponse =
        await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(
            reference
          )}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${secret}`,
            },

            cache:
              "no-store",
          }
        );
    } catch (networkError) {
      console.error(
        "POS MoMo Paystack verification network error:",
        networkError
      );

      /*
       * A network problem tells us nothing
       * about whether the customer actually
       * paid.
       *
       * Never mark the transaction failed
       * merely because our verification
       * request could not reach Paystack.
       */
      return NextResponse.json(
        {
          error:
            "Unable to reach Paystack to verify the payment",

          orderId:
            payment.order
              .orderId,

          paymentId:
            payment.id,

          reference,

          paymentStatus:
            payment.status,

          providerStatus:
            payment.providerStatus,

          orderFinalized:
            false,

          requiresAttention:
            false,
        },
        {
          status: 502,
        }
      );
    }

    let verification:
      PaystackVerifyResponse;

    try {
      verification =
        (await verifyResponse.json()) as
          PaystackVerifyResponse;
    } catch {
      console.error(
        "Invalid Paystack verification response"
      );

      return NextResponse.json(
        {
          error:
            "Paystack returned an invalid verification response",

          orderId:
            payment.order
              .orderId,

          paymentId:
            payment.id,

          reference,
        },
        {
          status: 502,
        }
      );
    }

    /*
     * Top-level verification.status reports
     * whether the API request succeeded.
     *
     * Transaction success/failure is read
     * from verification.data.status.
     */
    if (
      !verifyResponse.ok ||
      verification.status !==
        true ||
      !verification.data
    ) {
      console.error(
        "Paystack verification request failed:",
        {
          httpStatus:
            verifyResponse.status,

          message:
            verification.message,
        }
      );

      return NextResponse.json(
        {
          error:
            verification.message ||
            "Unable to verify Mobile Money payment",

          orderId:
            payment.order
              .orderId,

          paymentId:
            payment.id,

          reference,

          paymentStatus:
            payment.status,

          providerStatus:
            payment.providerStatus,

          orderFinalized:
            false,

          requiresAttention:
            false,
        },
        {
          status: 502,
        }
      );
    }

    const returnedReference =
      getString(
        verification.data
          .reference
      );

    const providerStatus =
      getString(
        verification.data
          .status
      );

    if (
      !returnedReference ||
      returnedReference !==
        reference
    ) {
      console.error(
        "Paystack verification reference mismatch:",
        {
          expected:
            reference,

          returned:
            returnedReference,
        }
      );

      return NextResponse.json(
        {
          error:
            "Paystack verification reference does not match the payment",
        },
        {
          status: 409,
        }
      );
    }

    if (!providerStatus) {
      return NextResponse.json(
        {
          error:
            "Paystack verification response has no transaction status",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * Keep the latest Paystack transaction
     * status visible in our own database.
     */
    await prisma.orderPayment.update({
      where: {
        id:
          payment.id,
      },

      data: {
        providerStatus,
      },
    });

    /*
     * ==========================================
     * SUCCESS
     * ==========================================
     *
     * Never implement stock logic here.
     *
     * Both webhook and status verification
     * must use the same shared finaliser.
     */
    if (
      providerStatus ===
      "success"
    ) {
      const amount =
        verification.data
          .amount;

      const currency =
        getString(
          verification.data
            .currency
        );

      const channel =
        getString(
          verification.data
            .channel
        );

      const metadata =
        parseMetadata(
          verification.data
            .metadata
        );

      if (
        typeof amount !==
          "number" ||
        !Number.isInteger(
          amount
        ) ||
        amount <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Paystack returned an invalid payment amount",

            orderId:
              payment.order
                .orderId,

            paymentId:
              payment.id,

            reference,

            requiresAttention:
              true,
          },
          {
            status: 409,
          }
        );
      }

      if (
        !currency ||
        !channel ||
        !metadata
      ) {
        return NextResponse.json(
          {
            error:
              "Paystack returned incomplete successful payment data",

            orderId:
              payment.order
                .orderId,

            paymentId:
              payment.id,

            reference,

            requiresAttention:
              true,
          },
          {
            status: 409,
          }
        );
      }

      try {
        const result =
          await finalizePosMomoPayment({
            reference,

            amountPesewas:
              amount,

            currency,

            channel,

            providerStatus,

            metadata,
          });

        return NextResponse.json({
          success: true,

          orderId:
            result.orderId,

          paymentId:
            result.paymentId,

          reference,

          paymentStatus:
            result.paymentConfirmed
              ? "CONFIRMED"
              : "PENDING",

          providerStatus,

          orderStatus:
            result.orderFinalized
              ? "PAID"
              : "PENDING",

          orderFinalized:
            result.orderFinalized,

          alreadyFinalized:
            result.alreadyFinalized,

          requiresAttention:
            result.requiresAttention,

          confirmedAmountPesewas:
            result.confirmedAmountPesewas,

          requiredAmountPesewas:
            result.requiredAmountPesewas,

          message:
            result.message,
        });
      } catch (error) {
        console.error(
          "POS MoMo verification finalisation error:",
          error
        );

        return NextResponse.json(
          {
            error:
              error instanceof
              Error
                ? error.message
                : "Unable to finalise confirmed Mobile Money payment",

            orderId:
              payment.order
                .orderId,

            paymentId:
              payment.id,

            reference,

            paymentStatus:
              payment.status,

            providerStatus,

            orderFinalized:
              false,

            requiresAttention:
              true,
          },
          {
            status: 500,
          }
        );
      }
    }

    /*
     * ==========================================
     * TERMINAL FAILURE
     * ==========================================
     *
     * Mark the individual payment allocation
     * failed.
     *
     * Do NOT mark the whole order failed here.
     * That is important for the forthcoming
     * split-tender workflow, where a failed
     * MoMo allocation can be replaced without
     * destroying other confirmed allocations.
     */
    if (
      isTerminalFailure(
        providerStatus
      )
    ) {
      await prisma.orderPayment.update({
        where: {
          id:
            payment.id,
        },

        data: {
          status:
            OrderPaymentStatus.FAILED,

          providerStatus,
        },
      });

      return NextResponse.json({
        success: true,

        orderId:
          payment.order
            .orderId,

        paymentId:
          payment.id,

        reference,

        paymentStatus:
          "FAILED",

        providerStatus,

        orderStatus:
          payment.order
            .paymentStatus,

        orderFinalized:
          false,

        alreadyFinalized:
          false,

        requiresAttention:
          false,

        message:
          verification.data
            .gateway_response ||
          verification.data
            .message ||
          "The Mobile Money payment was not completed.",
      });
    }

    /*
     * ==========================================
     * STILL WAITING
     * ==========================================
     *
     * Examples include Paystack transaction
     * statuses such as pending and ongoing.
     */
    return NextResponse.json({
      success: true,

      orderId:
        payment.order
          .orderId,

      paymentId:
        payment.id,

      reference,

      paymentStatus:
        "PENDING",

      providerStatus,

      orderStatus:
        payment.order
          .paymentStatus,

      orderFinalized:
        false,

      alreadyFinalized:
        false,

      requiresAttention:
        false,

      message:
        verification.data
          .gateway_response ||
        verification.data
          .message ||
        "Waiting for the customer to approve the Mobile Money payment.",
    });
  } catch (error) {
    console.error(
      "POS MoMo status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to check Mobile Money payment status",
      },
      {
        status: 500,
      }
    );
  }
}