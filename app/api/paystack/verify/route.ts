export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";

export async function GET(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY" },
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
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        cache: "no-store",
      }
    );

    const result = await res.json();

    if (!res.ok || !result?.data) {
      return NextResponse.json(
        { error: "Paystack verification failed" },
        { status: 500 }
      );
    }

    const paystackData = result.data;
    const orderId = paystackData?.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID missing from metadata" },
        { status: 400 }
      );
    }

    /* ===============================
       FIND ORDER
       =============================== */
    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ===============================
       TRANSLATE PAYMENT STATUS
       =============================== */
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;

    if (paystackData.status === "success") {
      paymentStatus = PaymentStatus.PAID;
    } else if (paystackData.status === "failed") {
      paymentStatus = PaymentStatus.FAILED;
    }

    /* ===============================
       UPDATE PAYMENT STATUS
       =============================== */
    if (order.paymentStatus !== paymentStatus) {
      await prisma.order.update({
        where: { orderId },
        data: {
          paymentStatus,
          reference,
        },
      });
    }

    /* ===============================
       ✅ SEND CUSTOMER SMS (ONCE)
       =============================== */
    if (
      paymentStatus === PaymentStatus.PAID &&
      !order.smsSent &&
      order.phone
    ) {
      const message = `DeeGlobalGH:

Payment received successfully ✅

Order ID: ${order.orderId}
Amount: GHS ${order.amount.toFixed(2)}

We are processing your order and will contact you shortly for delivery.

Thank you for shopping with us.`;

      await sendOrderSMS({
        phone: order.phone,
        message,
      });

      await prisma.order.update({
        where: { orderId },
        data: { smsSent: true },
      });
    }

    return NextResponse.json({
      ok: true,
      orderId,
      paymentStatus,
    });
  } catch (err: any) {
    console.error("❌ Paystack verify error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
