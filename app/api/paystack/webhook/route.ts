import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 🔥 PROOF THAT WEBHOOK WAS HIT
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
     2️⃣ Only handle successful charge
  ------------------------------------------------ */
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const reference: string = data.reference;

  /* ------------------------------------------------
     3️⃣ Fetch order from DB (SOURCE OF TRUTH)
  ------------------------------------------------ */
  const order = await prisma.order.findFirst({
    where: { reference },
  });

  if (!order) {
    console.error("❌ Order not found for reference:", reference);
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
      },
    });
  }

  /* ------------------------------------------------
     5️⃣ Normalize phone & send SMS (ONLY ONCE)
  ------------------------------------------------ */
  const customerPhone = order.phone
    .replace(/\s+/g, "")
    .replace(/^\+/, "");

  if (!order.smsSent && customerPhone.startsWith("233")) {
    console.log("📞 Sending SMS to:", customerPhone);

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
    } catch (err) {
      console.error("❌ SMS sending failed:", err);
    }
  } else if (!customerPhone.startsWith("233")) {
    console.error("❌ Invalid phone format for Hubtel:", customerPhone);
  }

  return NextResponse.json({ received: true });
}
