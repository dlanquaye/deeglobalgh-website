export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";

const SUPPORT_WHATSAPP_LINK = "https://wa.me/233246011773";

export async function GET(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY in env" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    /* ===============================
       VERIFY PAYMENT WITH PAYSTACK
       =============================== */
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Paystack verify error", details: data },
        { status: 500 }
      );
    }

    /* ===============================
       TRANSLATE PAYSTACK STATUS
       =============================== */
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;

    if (data?.data?.status === "success") {
      paymentStatus = PaymentStatus.PAID;
    } else if (data?.data?.status === "failed") {
      paymentStatus = PaymentStatus.FAILED;
    }

    const amount = data?.data?.amount ?? 0;
    const email = data?.data?.customer?.email ?? "";
    const phone = data?.data?.metadata?.phone ?? "";

    /* ===============================
       FIND OR CREATE ORDER
       =============================== */
    const existingOrder = await prisma.order.findUnique({
      where: { reference },
    });

    const order =
      existingOrder ??
      (await prisma.order.create({
        data: {
          orderId: reference,
          reference,
          email,
          phone,
          amount,
          paymentStatus,
        },
      }));

    /* ===============================
       UPDATE STATUS IF CHANGED
       =============================== */
    if (order.paymentStatus !== paymentStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus },
      });
    }

    /* ===============================
       SEND SMS (ONCE PER PAYMENT)
       =============================== */
   
if (
  !order.smsSent &&
  phone &&
  (paymentStatus === PaymentStatus.PAID ||
    paymentStatus === PaymentStatus.FAILED)
) {

      let message = "";

      if (paymentStatus === PaymentStatus.PAID) {
        const amountGHS = amount / 100;
        message = `DeeglobalGh: Payment confirmed ✅
Order Ref: ${reference}
Amount: GHS ${amountGHS}

Thank you for shopping with us.`;
      }

      if (paymentStatus === PaymentStatus.FAILED) {
        message = `DeeglobalGh: Your payment was not successful ❌

Please tap the link below to chat with our support team on WhatsApp for help:
${SUPPORT_WHATSAPP_LINK}`;
      }

      if (message) {
        try {
          await sendOrderSMS({ phone, message });

          await prisma.order.update({
            where: { id: order.id },
            data: { smsSent: true },
          });
        } catch {
          // ❌ Never block payment flow because SMS failed
          // SMS can be retried manually if needed
        }
      }
    }

    return NextResponse.json({
      ok: true,
      reference,
      paymentStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
