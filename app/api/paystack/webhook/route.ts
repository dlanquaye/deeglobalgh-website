import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";


export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const body = await req.text();

  // 1️⃣ Verify Paystack signature
  const signature = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  const paystackSignature = req.headers.get("x-paystack-signature");

  if (signature !== paystackSignature) {
    return NextResponse.json(
      { error: "Invalid Paystack signature" },
      { status: 401 }
    );
  }

  const event = JSON.parse(body);

  // 2️⃣ Only handle successful charge
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;

  const reference: string = data.reference;
  const amountPaid = data.amount / 100; // Paystack sends kobo/pesewas
  const customerPhone: string | undefined =
    data?.metadata?.phone || data?.customer?.phone;

  // 3️⃣ Find order by reference
  const order = await prisma.order.findFirst({
    where: { reference },
  });

  if (!order) {
    console.error("❌ Order not found for reference:", reference);
    return NextResponse.json({ received: true });
  }

  // 4️⃣ Update order as PAID
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
    },
  });

  // 5️⃣ Send SMS ONLY ONCE
  if (!order.smsSent && customerPhone) {
    const message = `DeeglobalGh: Payment received successfully for order ${reference}. Our team will contact you shortly for delivery. Thank you.`;

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
  }

  return NextResponse.json({ received: true });
}
