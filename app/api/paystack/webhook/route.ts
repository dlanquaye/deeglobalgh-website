import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";
import { InventoryMovementType } from "@prisma/client";

export const runtime = "nodejs";

/* ===============================
   Normalize Ghana Phone
================================ */
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

/* ===============================
   PAYSTACK WEBHOOK
================================ */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const body = await req.text();

    const computedSignature = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    const paystackSignature = req.headers.get("x-paystack-signature");

    if (computedSignature !== paystackSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const data = event.data;
    const reference: string = data.reference;

    /* ===============================
       Find Order by Reference
    =============================== */
    const order = await prisma.order.findFirst({
      where: { orderId: reference },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json({ received: true });
    }

    /* ===============================
       Idempotency Check
       If already paid, exit safely
    =============================== */
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true });
    }

    /* ===============================
       Transaction:
       - Deduct stock
       - Create inventory movement
       - Mark order as PAID
    =============================== */
    await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }, // ✅ FIXED (was sku)
        });

        if (!product) {
          throw new Error("Product not found during webhook deduction");
        }

        if (product.stockQty < item.quantity) {
          throw new Error("Stock inconsistency detected");
        }

        await tx.product.update({
          where: { id: item.productId }, // ✅ FIXED
          data: {
            stockQty: { decrement: item.quantity },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: InventoryMovementType.SALE,
            quantity: -item.quantity,
            note: `Online Order ${order.orderId}`,
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          reference: reference,
        },
      });
    });

    /* ===============================
       Send SMS (Idempotent)
    =============================== */
    const customerPhone = normalizeGhanaPhone(order.phone);

    if (customerPhone && !order.smsSent) {
      const message = `DeeglobalGh: Payment received successfully for order ${reference}. Our team will contact you shortly to confirm delivery. Thank you.`;

      await sendOrderSMS({
        phone: customerPhone,
        message,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { smsSent: true },
      });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
