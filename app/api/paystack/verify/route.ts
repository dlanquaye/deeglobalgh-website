export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PaymentStatus, InventoryMovementType } from "@prisma/client";
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
    // 🔒 Verify reference consistency
if (paystackData.reference !== reference) {
  throw new Error("Reference mismatch");
}
    const orderId = paystackData?.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID missing from metadata" },
        { status: 400 }
      );
    }

    /* ===============================
       FIND ORDER + ITEMS
    =============================== */
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { orderItems: true },
    });
    // 🔒 Stop if already paid (idempotency protection)
if (order?.paymentStatus === PaymentStatus.PAID) {
  return NextResponse.json({
    ok: true,
    orderId,
    paymentStatus: PaymentStatus.PAID,
  });
}
    console.log("VERIFY ORDER ITEMS:", order?.orderItems);


    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ===============================
       CHECK PAYMENT STATUS
    =============================== */
    if (paystackData.status !== "success") {
      await prisma.order.update({
        where: { orderId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          reference,
        },
      });

      return NextResponse.json({
        ok: true,
        orderId,
        paymentStatus: PaymentStatus.FAILED,
      });
    }
    // 🔒 Verify amount integrity
const paidAmount = paystackData.amount / 100;

if (paidAmount !== Number(order.amount)) {
  throw new Error("Payment amount mismatch");
}

    /* ===============================
       CHECK IF STOCK ALREADY DEDUCTED
    =============================== */
    const existingMovement = await prisma.inventoryMovement.findFirst({
      where: {
        note: `Online Order ${order.orderId}`,
      },
    });

    if (!existingMovement) {
      /* ===============================
         ATOMIC DEDUCTION
      =============================== */
      await prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product || product.stockQty < item.quantity) {
            throw new Error(
              `Stock inconsistency detected for product ${item.productId}`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
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
          where: { orderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            reference,
          },
        });
      });
    }

    /* ===============================
       SEND SMS (ONCE)
    =============================== */
    if (!order.smsSent && order.phone) {
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
      paymentStatus: PaymentStatus.PAID,
    });

  } catch (err: any) {
    console.error("❌ Paystack verify error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
