export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
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
       🔒 ADMIN AUTH
       =============================== */
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("dg_admin");

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

    /* ===============================
       🔎 LOAD ORDER + ITEMS
       =============================== */
    let order = null;

    if (typeof body.id === "string") {
      order = await prisma.order.findUnique({
        where: { id: body.id },
        include: { orderItems: true },
      });
    } else if (typeof body.orderId === "string") {
      order = await prisma.order.findUnique({
        where: { orderId: body.orderId },
        include: { orderItems: true },
      });
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ===============================
       🚦 VALIDATE STATUS TRANSITION
       =============================== */
    const allowedNext = VALID_TRANSITIONS[order.paymentStatus];

    if (!allowedNext.includes(nextStatus)) {
      return NextResponse.json(
        {
          error: `Invalid transition from ${order.paymentStatus} to ${nextStatus}`,
        },
        { status: 400 }
      );
    }

    /* ===============================
       🔁 HANDLE STOCK ROLLBACK
       =============================== */
    if (
      nextStatus === PaymentStatus.CANCELLED &&
      (order.paymentStatus === PaymentStatus.PAID ||
        order.paymentStatus === PaymentStatus.DELIVERING)
    ) {
      await prisma.$transaction(async (tx) => {
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

        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: PaymentStatus.CANCELLED },
        });
      });

      return NextResponse.json({ success: true });
    }

    /* ===============================
       ✅ NORMAL STATUS UPDATE
       =============================== */
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: nextStatus },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ update-order-status error:", error);

    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
