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

    /* =====================================================
       1️⃣ VERIFY TRANSACTION WITH PAYSTACK
    ===================================================== */

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        cache: "no-store",
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData?.data) {
      return NextResponse.json(
        { error: "Paystack verification failed." },
        { status: 500 }
      );
    }

    const paystackData = verifyData.data;
    const orderId = paystackData?.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID missing from metadata." },
        { status: 400 }
      );
    }

    /* =====================================================
       2️⃣ FIND ORDER + ITEMS
    ===================================================== */

    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { orderItems: true },
    });
    console.log("ORDER ITEMS:", order?.orderItems);


    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    /* =====================================================
       3️⃣ HANDLE FAILED PAYMENT
    ===================================================== */

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

    /* =====================================================
       4️⃣ IDEMPOTENCY CHECK
       Prevent double deduction if webhook retries
    ===================================================== */

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({
        ok: true,
        orderId,
        paymentStatus: PaymentStatus.PAID,
      });
    }

    /* =====================================================
       5️⃣ ATOMIC STOCK DEDUCTION (RACE-CONDITION SAFE)
    ===================================================== */

    await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        /**
         * 🔒 Enterprise-level stock lock:
         * Update only if stockQty >= requested quantity
         * If zero rows updated → stock already insufficient
         */
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQty: {
              gte: item.quantity,
            },
          },
          data: {
            stockQty: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(
            `Stock unavailable for product ${item.productId}`
          );
        }

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

    /* =====================================================
       6️⃣ SEND SMS (ONLY ONCE)
    ===================================================== */

    

    return NextResponse.redirect(
  `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?orderId=${orderId}`
);


  } catch (err: any) {
    console.error("❌ Paystack verify error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error." },
      { status: 500 }
    );
  }
}
