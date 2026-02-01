export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

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
       FIND EXISTING ORDER
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
       ✅ CUSTOMER WHATSAPP MESSAGE
       (ONLY ONCE, ONLY IF PAID)
       =============================== */
    if (
      paymentStatus === PaymentStatus.PAID &&
      !order.smsSent &&
      order.phone
    ) {
      const message = `Hello ${order.email || "Customer"},

✅ Payment received successfully!

Your order (${order.orderId}) has been confirmed.
Our team will begin processing it shortly and contact you for delivery.

Thank you for shopping with DeeGlobalGH.`;

      const whatsappUrl =
        `https://wa.me/233${order.phone.replace(/^0/, "")}` +
        `?text=${encodeURIComponent(message)}`;

      // Fire-and-forget (no await needed)
      fetch(whatsappUrl).catch(() => {});

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
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
