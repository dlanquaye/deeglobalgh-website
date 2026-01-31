import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";

export const runtime = "nodejs";

/**
 * Normalize Ghana phone number to 233XXXXXXXXX
 */
function normalizeGhanaPhone(phone: string) {
  let p = phone.replace(/\s+/g, "").replace(/^\+/, "");

  if (p.startsWith("0") && p.length === 10) {
    return "233" + p.slice(1);
  }

  if (p.startsWith("233") && p.length === 12) {
    return p;
  }

  return null;
}

export async function POST(req: NextRequest) {
  console.log("🔥 PAYSTACK WEBHOOK HIT");

  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error("❌ Missing PAYSTACK_SECRET_KEY");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const body = await req.text();

  /* ------------------------------------------------
     1️⃣ Verify Paystack signature
  ------------------------------------------------ */
  const computedSignature = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  const paystackSignature = req.headers.get("x-paystack-signature");

  if (computedSignature !== paystackSignature) {
    console.error("❌ Invalid Paystack signature");
    return NextResponse.json(
      { error: "Invalid Paystack signature" },
      { status: 401 }
    );
  }

  const event = JSON.parse(body);

  /* ------------------------------------------------
     2️⃣ Only handle successful payment
  ------------------------------------------------ */
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const reference: string = data.reference; // THIS IS OUR orderId

  console.log("✅ Payment success for:", reference);

  /* ------------------------------------------------
     3️⃣ Find order using orderId (SOURCE OF TRUTH)
  ------------------------------------------------ */
  const order = await prisma.order.findFirst({
    where: { orderId: reference },
  });

  if (!order) {
    console.error("❌ Order not found for orderId:", reference);
    return NextResponse.json({ received: true });
  }

  /* ------------------------------------------------
     4️⃣ Mark order as PAID (idempotent)
  ------------------------------------------------ */
  if (order.paymentStatus !== "PAID") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        reference: reference, // store Paystack reference
      },
    });
  }

  /* ------------------------------------------------
     5️⃣ Send SMS ONCE
  ------------------------------------------------ */
  const customerPhone = normalizeGhanaPhone(order.phone);

  if (!customerPhone) {
    console.error("❌ Invalid phone number:", order.phone);
    return NextResponse.json({ received: true });
  }

  if (!order.smsSent) {
    console.log("📩 Sending SMS to:", customerPhone);

    const message = `DeeglobalGh: Payment received successfully for order ${reference}. Our team will contact you shortly to confirm delivery. Thank you.`;

    try {
      await sendOrderSMS({
        phone: customerPhone,
        message,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { smsSent: true },
      });

      console.log("✅ SMS sent successfully");
    } catch (err) {
      console.error("❌ SMS sending failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}
