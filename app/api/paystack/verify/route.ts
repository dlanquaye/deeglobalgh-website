export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";
import { finalizeWebsitePaystackPayment } from "@/lib/payments/finalizeWebsitePaystackPayment";
import { getOrderAmountGhs } from "@/lib/pos/orderMoney";

export async function GET(req: Request) {
  try {
    const secret =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        {
          error:
            "Missing PAYSTACK_SECRET_KEY",
        },
        {
          status: 500,
        }
      );
    }

    const url =
      new URL(req.url);

    const reference =
      url.searchParams.get(
        "reference"
      );

    if (!reference) {
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
     * VERIFY PAYMENT WITH PAYSTACK
     * ==========================================
     */
    const res =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization:
              `Bearer ${secret}`,
          },

          cache:
            "no-store",
        }
      );

    const result =
      await res.json();

    if (
      !res.ok ||
      !result?.data
    ) {
      return NextResponse.json(
        {
          error:
            "Paystack verification failed",
        },
        {
          status: 502,
        }
      );
    }

    const paystackData =
      result.data;

    const orderId =
      typeof paystackData
        ?.metadata
        ?.orderId ===
      "string"
        ? paystackData
            .metadata
            .orderId
            .trim()
        : "";

    if (!orderId) {
      return NextResponse.json(
        {
          error:
            "Order ID missing from metadata",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * UNSUCCESSFUL / INCOMPLETE PAYMENT
     * ==========================================
     *
     * Do not mark pending/abandoned transactions
     * FAILED merely because verification was
     * requested before Paystack confirmed success.
     */
    if (
      paystackData.status !==
      "success"
    ) {
      return NextResponse.json({
        ok: true,
        orderId,
        paymentStatus:
          "PENDING",
        providerStatus:
          paystackData.status ??
          null,
      });
    }

    const amountPesewas =
      paystackData.amount;

    const currency =
      typeof paystackData
        .currency ===
      "string"
        ? paystackData.currency
        : "";

    if (
      !Number.isInteger(
        amountPesewas
      ) ||
      typeof amountPesewas !==
        "number" ||
      amountPesewas <= 0
    ) {
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

    /*
     * ==========================================
     * AUTHORITATIVE PAYMENT FINALISATION
     * ==========================================
     */
    const finalization =
      await finalizeWebsitePaystackPayment({
        reference,

        orderId,

        amountPesewas,

        currency,

        providerStatus:
          paystackData.status,
      });

    /*
     * ==========================================
     * SEND SMS AFTER SAFE FINALISATION
     * ==========================================
     */
    if (
      finalization.paymentConfirmed &&
      !finalization.requiresAttention
    ) {
      const order =
        await prisma.order.findUnique({
          where: {
            orderId,
          },

          select: {
            id: true,
            orderId: true,
            phone: true,
            smsSent: true,
            receiptToken: true,
            amount: true,
            amountPesewas: true,
          },
        });

      if (
        order &&
        !order.smsSent &&
        order.phone
      ) {
        try {
          const digitalReceiptUrl =
            order.receiptToken
              ? `https://www.shopdeeglobalgh.com/r/${order.receiptToken}`
              : null;

          const message =
            `DeeGlobalGH:\n\n` +
            `Payment received successfully ✅\n\n` +
            `Order ID: ${order.orderId}\n` +
            `Amount: GHS ${getOrderAmountGhs(order).toFixed(2)}\n\n` +
            (
              digitalReceiptUrl
                ? `Digital receipt:\n${digitalReceiptUrl}\n\n`
                : ""
            ) +
            `We are processing your order and will contact you shortly.\n\n` +
            `Thank you for shopping with us.`;

          await sendOrderSMS({
            phone:
              order.phone,

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
        } catch (smsError) {
          console.error(
            "SMS failed:",
            smsError
          );
        }
      }
    }

    return NextResponse.json({
      ok: true,
      orderId,
      paymentStatus:
        finalization
          .paymentConfirmed
          ? "PAID"
          : "PENDING",
      orderFinalized:
        finalization
          .orderFinalized,
      alreadyFinalized:
        finalization
          .alreadyFinalized,
      requiresAttention:
        finalization
          .requiresAttention,
    });
  } catch (err) {
    console.error(
      "Paystack verification error:",
      err
    );

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Payment verification failed",
      },
      {
        status: 500,
      }
    );
  }
}