import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
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
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
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
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  /* ------------------------------------------------
     2️⃣ Only handle successful payment
  ------------------------------------------------ */
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference: string = event.data.reference;

  console.log("✅ Payment success for:", reference);

  /* ------------------------------------------------
     3️⃣ Find order
  ------------------------------------------------ */
  const order = await prisma.order.findFirst({
    where: { orderId: reference },
    include: { orderItems: true },
  });

  if (!order) {
    console.error("❌ Order not found:", reference);
    return NextResponse.json({ received: true });
  }

  /* ------------------------------------------------
     4️⃣ Transaction: mark paid + reduce stock (IDEMPOTENT)
  ------------------------------------------------ */
  if (!order.stockReduced) {
    await prisma.$transaction(async (tx) => {
      // Mark paid
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          reference: reference,
        },
      });

      // Reduce stock + create movement
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: {
              decrement: item.quantity,
            },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            orderId: order.id,
            type: "SALE",
            quantity: item.quantity,
            note: `Sale for order ${reference}`,
          },
        });
      }

      // Mark stock reduced (CRITICAL)
      await tx.order.update({
        where: { id: order.id },
        data: { stockReduced: true },
      });
    });

    console.log("📦 Stock reduced successfully");
  } else {
    console.log("⚠️ Stock already reduced, skipping");
  }

  /* ------------------------------------------------
     5️⃣ Send SMS ONCE
  ------------------------------------------------ */
  const customerPhone = normalizeGhanaPhone(order.phone);

  if (customerPhone && !order.smsSent) {
    try {
      await sendOrderSMS({
        phone: customerPhone,
        message: `DeeglobalGh: Payment received for order ${reference}. We will contact you shortly.`,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { smsSent: true },
      });

      console.log("📩 SMS sent");
    } catch (err) {
      console.error("❌ SMS failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}