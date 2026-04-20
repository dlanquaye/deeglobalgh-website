export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { PaymentStatus, InventoryMovementType } from "@prisma/client";

/* ===============================
   🚦 Valid Status Transitions
=============================== */
const VALID_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [
    PaymentStatus.PAID,
    PaymentStatus.FAILED,
  ],
  [PaymentStatus.PAID]: [
    PaymentStatus.DELIVERING,
    PaymentStatus.COMPLETED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.DELIVERING]: [
    PaymentStatus.COMPLETED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.FAILED]: [],
  [PaymentStatus.COMPLETED]: [],
  [PaymentStatus.CANCELLED]: [],
};

export async function POST(req: NextRequest) {
  try {
    /* ===============================
   🔒 VERIFY ADMIN AUTH
=============================== */
const cookieStore = await cookies();
const rawCookie = cookieStore.get("dg_admin")?.value;

let isAdmin = false;

if (rawCookie) {
  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie));

    if (parsed.role === "SUPER_ADMIN") {
      isAdmin = true;
    }
  } catch (e) {
    console.error("Invalid admin cookie");
  }
}

if (!isAdmin) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const body = await req.json();
const nextStatus = body.status as PaymentStatus;

if (!Object.values(PaymentStatus).includes(nextStatus)) {
  return NextResponse.json(
    { error: "Invalid status value" },
    { status: 400 }
  );
}

if (!body.id && !body.orderId) {
  return NextResponse.json(
    { error: "Order identifier missing" },
    { status: 400 }
  );
}

    /* ===============================
       🔐 ATOMIC TRANSACTION
    =============================== */
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: body.id
          ? { id: body.id }
          : { orderId: body.orderId },
        include: { orderItems: true },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      /* ===============================
         🛑 Idempotency Guard (FIXED)
      =============================== */
      if (order.paymentStatus === nextStatus) {
        return; // ✅ clean exit (NO response here)
      }

      /* ===============================
         🚦 Validate Transition
      =============================== */
      const allowedNext = VALID_TRANSITIONS[order.paymentStatus];

      if (!allowedNext.includes(nextStatus)) {
        throw new Error(
          `INVALID_TRANSITION_${order.paymentStatus}_TO_${nextStatus}`
        );
      }

      /* ===============================
         🔁 Stock Rollback Logic
      =============================== */
      if (
        nextStatus === PaymentStatus.CANCELLED &&
        (order.paymentStatus === PaymentStatus.PAID ||
          order.paymentStatus === PaymentStatus.DELIVERING)
      ) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQty: {
                increment: item.quantity,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: InventoryMovementType.RETURN,
              quantity: item.quantity,
              note: `Order ${order.orderId} Cancelled`,
            },
          });
        }
      }

      /* ===============================
         ✅ Final Status Update
      =============================== */
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: nextStatus },
      });
    });

    /* ===============================
       ✅ SUCCESS RESPONSE (CRITICAL FIX)
    =============================== */
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ update-order-status error:", error);

    if (error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (error.message?.startsWith("INVALID_TRANSITION")) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}