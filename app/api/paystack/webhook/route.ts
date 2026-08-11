import {
  NextRequest,
  NextResponse,
} from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";
import { finalizePosMomoPayment } from "@/lib/pos/finalizePosMomoPayment";

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
 *
 * timingSafeEqual avoids a normal
 * string-comparison timing leak.
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
  console.log(
    "PAYSTACK WEBHOOK HIT"
  );

  /*
   * ==========================================
   * READ RAW BODY
   * ==========================================
   *
   * Signature validation must use the exact
   * original request body sent by Paystack.
   */
  const body =
    await req.text();

  /*
   * We parse the raw body only to determine
   * which Paystack environment this event
   * belongs to.
   *
   * IMPORTANT:
   * Nothing from this unverified event is
   * trusted or processed until its signature
   * has been validated below.
   */
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
   * SELECT REQUIRED SECRET
   * ==========================================
   *
   * Website payments continue using:
   *
   *   PAYSTACK_SECRET_KEY
   *
   * POS MoMo uses:
   *
   *   PAYSTACK_POS_SECRET_KEY
   *
   * when configured.
   *
   * The fallback preserves backwards
   * compatibility after testing when the
   * separate POS key is not configured.
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

  const paystackSignature =
    req.headers.get(
      "x-paystack-signature"
    );

  /*
   * ==========================================
   * VERIFY SIGNATURE
   * ==========================================
   *
   * When PAYSTACK_POS_SECRET_KEY exists,
   * POS_MOMO events MUST validate against
   * that key.
   *
   * They cannot silently fall back to the
   * website key merely because the website
   * signature would validate.
   */
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
   * From this point onward the payload has
   * passed Paystack signature validation.
   */

  /*
   * We only deliver value for an
   * independently confirmed successful
   * Paystack charge.
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
   * POS MoMo references belong to
   * OrderPayment, not Order.orderId.
   *
   * These transactions therefore use the
   * authoritative POS finalisation service.
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
      !Number.isInteger(
        amount
      ) ||
      typeof amount !==
        "number" ||
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

      /*
       * If payment is confirmed but stock
       * finalisation requires manual attention,
       * the service deliberately preserves the
       * confirmed customer payment.
       *
       * We acknowledge the webhook so Paystack
       * does not repeatedly redeliver a genuine
       * payment that is already recorded.
       */
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
      /*
       * Validation/database lookup failures
       * are not acknowledged as successfully
       * processed.
       *
       * Returning 500 allows a legitimate
       * Paystack webhook to be retried rather
       * than silently discarded.
       */
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
   * EXISTING WEBSITE PAYSTACK FLOW
   * ==========================================
   *
   * IMPORTANT:
   * Keep the existing live website behaviour
   * intact while POS MoMo is introduced.
   */
  console.log(
    "Payment success for:",
    reference
  );

  const order =
    await prisma.order.findFirst({
      where: {
        orderId:
          reference,
      },

      include: {
        orderItems: true,
      },
    });

  if (!order) {
    console.error(
      "Order not found:",
      reference
    );

    return NextResponse.json({
      received: true,
    });
  }

  /*
   * Existing website transaction:
   * mark paid + reduce stock.
   */
  if (!order.stockReduced) {
    await prisma.$transaction(
      async (tx) => {
        await tx.order.update({
          where: {
            id:
              order.id,
          },

          data: {
            paymentStatus:
              "PAID",

            reference,
          },
        });

        for (
          const item of
          order.orderItems
        ) {
          await tx.product.update({
            where: {
              id:
                item.productId,
            },

            data: {
              stockQty: {
                decrement:
                  item.quantity,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              productId:
                item.productId,

              orderId:
                order.id,

              type:
                "SALE",

              quantity:
                item.quantity,

              note:
                `Sale for order ${reference}`,
            },
          });
        }

        await tx.order.update({
          where: {
            id:
              order.id,
          },

          data: {
            stockReduced:
              true,
          },
        });
      }
    );

    console.log(
      "Stock reduced successfully"
    );
  } else {
    console.log(
      "Stock already reduced, skipping"
    );
  }

  /*
   * Existing website SMS behaviour.
   */
  const customerPhone =
    normalizeGhanaPhone(
      order.phone
    );

  if (
    customerPhone &&
    !order.smsSent
  ) {
    try {
      await sendOrderSMS({
        phone:
          customerPhone,

        message:
          `DeeglobalGh: Payment received for order ${reference}. We will contact you shortly.`,
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

      console.log(
        "SMS sent"
      );
    } catch (error) {
      console.error(
        "SMS failed:",
        error
      );
    }
  }

  return NextResponse.json({
    received: true,
  });
}