import {
  NextRequest,
  NextResponse,
} from "next/server";

import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";
import { finalizePosMomoPayment } from "@/lib/pos/finalizePosMomoPayment";
import { finalizeWebsitePaystackPayment } from "@/lib/payments/finalizeWebsitePaystackPayment";
import { getOrderAmountGhs } from "@/lib/pos/orderMoney";

export const runtime = "nodejs";

type PaystackMetadata = {
  source?: unknown;
  orderId?: unknown;
  orderPaymentId?: unknown;
  branchId?: unknown;
  actorId?: unknown;
};

type PaystackWebhookEvent = {
  event?: string;

  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    channel?: string;
    metadata?: PaystackMetadata | null;
  };
};

/**
 * Normalize Ghana phone number
 * to 233XXXXXXXXX.
 */
function normalizeGhanaPhone(
  phone: string
) {
  let p = phone
    .replace(/\s+/g, "")
    .replace(/^\+/, "");

  if (
    p.startsWith("0") &&
    p.length === 10
  ) {
    return (
      "233" + p.slice(1)
    );
  }

  if (
    p.startsWith("233") &&
    p.length === 12
  ) {
    return p;
  }

  return null;
}

function getString(
  value: unknown
) {
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

/**
 * Verify Paystack's HMAC SHA-512
 * webhook signature.
 */
function verifyPaystackSignature(
  body: string,
  signature: string | null,
  secret: string
) {
  if (!signature) {
    return false;
  }

  const computedSignature =
    crypto
      .createHmac(
        "sha512",
        secret
      )
      .update(body)
      .digest("hex");

  const expected =
    Buffer.from(
      computedSignature,
      "utf8"
    );

  const received =
    Buffer.from(
      signature.trim(),
      "utf8"
    );

  if (
    expected.length !==
    received.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expected,
    received
  );
}

export async function POST(
  req: NextRequest
) {
  /*
   * ==========================================
   * READ RAW BODY
   * ==========================================
   *
   * Paystack signature validation must use
   * the exact original request body.
   */
  const body =
    await req.text();

  let event:
    PaystackWebhookEvent;

  try {
    event =
      JSON.parse(body) as
        PaystackWebhookEvent;
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid webhook payload",
      },
      {
        status: 400,
      }
    );
  }

  const metadata =
    event.data?.metadata ??
    null;

  const source =
    getString(
      metadata?.source
    );

  /*
   * ==========================================
   * SELECT PAYSTACK SECRET
   * ==========================================
   */
  const websiteSecret =
    process.env
      .PAYSTACK_SECRET_KEY;

  const posSecret =
    process.env
      .PAYSTACK_POS_SECRET_KEY;

  let requiredSecret:
    string | undefined;

  if (
    source === "POS_MOMO"
  ) {
    requiredSecret =
      posSecret ??
      websiteSecret;
  } else {
    requiredSecret =
      websiteSecret;
  }

  if (!requiredSecret) {
    console.error(
      source === "POS_MOMO"
        ? "Missing Paystack secret for POS MoMo webhook"
        : "Missing PAYSTACK_SECRET_KEY"
    );

    return NextResponse.json(
      {
        error:
          "Server misconfigured",
      },
      {
        status: 500,
      }
    );
  }

  /*
   * ==========================================
   * VERIFY PAYSTACK SIGNATURE
   * ==========================================
   */
  const paystackSignature =
    req.headers.get(
      "x-paystack-signature"
    );

  const signatureValid =
    verifyPaystackSignature(
      body,
      paystackSignature,
      requiredSecret
    );

  if (!signatureValid) {
    console.error(
      source === "POS_MOMO"
        ? "Invalid POS MoMo Paystack signature"
        : "Invalid website Paystack signature"
    );

    return NextResponse.json(
      {
        error:
          "Invalid signature",
      },
      {
        status: 401,
      }
    );
  }

  /*
   * Only independently confirmed successful
   * Paystack charges can deliver value.
   */
  if (
    event.event !==
    "charge.success"
  ) {
    return NextResponse.json({
      received: true,
    });
  }

  const reference =
    getString(
      event.data?.reference
    );

  if (!reference) {
    console.error(
      "Paystack webhook missing reference"
    );

    return NextResponse.json(
      {
        error:
          "Missing reference",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * ==========================================
   * POS MOBILE MONEY
   * ==========================================
   *
   * Preserve the existing hardened POS MoMo
   * finalisation path.
   */
  if (
    source === "POS_MOMO"
  ) {
    const amount =
      event.data?.amount;

    const currency =
      getString(
        event.data?.currency
      );

    const channel =
      getString(
        event.data?.channel
      );

    const providerStatus =
      getString(
        event.data?.status
      );

    if (
      typeof amount !==
        "number" ||
      !Number.isInteger(
        amount
      ) ||
      amount <= 0
    ) {
      console.error(
        "Invalid POS MoMo Paystack amount:",
        amount
      );

      return NextResponse.json(
        {
          error:
            "Invalid payment amount",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !currency ||
      !channel ||
      !providerStatus
    ) {
      console.error(
        "Incomplete POS MoMo Paystack data"
      );

      return NextResponse.json(
        {
          error:
            "Incomplete payment data",
        },
        {
          status: 400,
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

      if (
        result.requiresAttention
      ) {
        console.error(
          "POS MoMo payment requires attention:",
          result
        );
      } else {
        console.log(
          "POS MoMo payment processed:",
          {
            orderId:
              result.orderId,

            paymentId:
              result.paymentId,

            orderFinalized:
              result.orderFinalized,

            alreadyFinalized:
              result.alreadyFinalized,
          }
        );
      }

      return NextResponse.json({
        received: true,

        source:
          "POS_MOMO",

        paymentConfirmed:
          result.paymentConfirmed,

        orderFinalized:
          result.orderFinalized,

        alreadyFinalized:
          result.alreadyFinalized,

        requiresAttention:
          result.requiresAttention,

        orderId:
          result.orderId,

        paymentId:
          result.paymentId,
      });
    } catch (error) {
      console.error(
        "POS MoMo webhook finalisation error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error instanceof
            Error
              ? error.message
              : "POS Mobile Money finalisation failed",
        },
        {
          status: 500,
        }
      );
    }
  }

  /*
   * ==========================================
   * WEBSITE PAYSTACK PAYMENT
   * ==========================================
   *
   * Website callback verification and Paystack
   * webhook delivery now use exactly the same
   * authoritative finalisation service.
   */
  const websiteOrderId =
    getString(
      metadata?.orderId
    );

  const amount =
    event.data?.amount;

  const currency =
    getString(
      event.data?.currency
    );

  const providerStatus =
    getString(
      event.data?.status
    );

  if (!websiteOrderId) {
    console.error(
      "Website Paystack webhook missing orderId metadata:",
      reference
    );

    return NextResponse.json(
      {
        error:
          "Missing order ID",
      },
      {
        status: 400,
      }
    );
  }

  if (
    typeof amount !==
      "number" ||
    !Number.isInteger(
      amount
    ) ||
    amount <= 0
  ) {
    console.error(
      "Invalid website Paystack amount:",
      amount
    );

    return NextResponse.json(
      {
        error:
          "Invalid payment amount",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !currency ||
    !providerStatus
  ) {
    console.error(
      "Incomplete website Paystack payment data:",
      {
        reference,
        websiteOrderId,
      }
    );

    return NextResponse.json(
      {
        error:
          "Incomplete payment data",
      },
      {
        status: 400,
      }
    );
  }

  let finalization:
    Awaited<
      ReturnType<
        typeof finalizeWebsitePaystackPayment
      >
    >;

  try {
    finalization =
      await finalizeWebsitePaystackPayment({
        reference,

        orderId:
          websiteOrderId,

        amountPesewas:
          amount,

        currency,

        providerStatus,
      });
  } catch (error) {
    /*
     * Do not acknowledge a genuine payment as
     * fully processed when its authoritative
     * finalisation failed.
     *
     * Paystack may retry the webhook.
     */
    console.error(
      "Website Paystack webhook finalisation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Website payment finalisation failed",
      },
      {
        status: 500,
      }
    );
  }

  if (
    finalization
      .requiresAttention
  ) {
    /*
     * A historical PAID order with ambiguous
     * old stock state must never be deducted
     * automatically a second time.
     */
    console.error(
      "Website payment requires stock reconciliation:",
      finalization
    );

    return NextResponse.json({
      received: true,

      source:
        "WEBSITE",

      paymentConfirmed:
        finalization
          .paymentConfirmed,

      orderFinalized:
        finalization
          .orderFinalized,

      alreadyFinalized:
        finalization
          .alreadyFinalized,

      requiresAttention:
        true,

      orderId:
        finalization
          .orderId,
    });
  }

  /*
   * ==========================================
   * WEBSITE PAYMENT SMS
   * ==========================================
   */
  const order =
    await prisma.order.findUnique({
      where: {
        orderId:
          finalization.orderId,
      },

      select: {
        id: true,
        orderId: true,
        phone: true,
        smsSent: true,
        amount: true,
        amountPesewas: true,
      },
    });

  if (
    order &&
    !order.smsSent
  ) {
    const customerPhone =
      normalizeGhanaPhone(
        order.phone
      );

    if (customerPhone) {
      try {
        const message =
          `DeeGlobalGH:\n\n` +
          `Payment received successfully ✅\n\n` +
          `Order ID: ${order.orderId}\n` +
          `Amount: GHS ${getOrderAmountGhs(order).toFixed(2)}\n\n` +
          `We are processing your order and will contact you shortly.\n\n` +
          `Thank you for shopping with us.`;

        await sendOrderSMS({
          phone:
            customerPhone,

          message,
        });

        await prisma.order.update({
          where: {
            id:
              order.id,
          },

          data: {
            smsSent:
              true,
          },
        });
      } catch (error) {
        console.error(
          "Website payment SMS failed:",
          error
        );
      }
    }
  }

  return NextResponse.json({
    received: true,

    source:
      "WEBSITE",

    paymentConfirmed:
      finalization
        .paymentConfirmed,

    orderFinalized:
      finalization
        .orderFinalized,

    alreadyFinalized:
      finalization
        .alreadyFinalized,

    requiresAttention:
      finalization
        .requiresAttention,

    orderId:
      finalization
        .orderId,
  });
}
