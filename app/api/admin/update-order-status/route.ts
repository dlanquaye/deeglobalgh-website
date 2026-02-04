export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

const ALLOWED_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "DELIVERING",
  "COMPLETED",
] as const;

type Status = (typeof ALLOWED_STATUSES)[number];

const VALID_TRANSITIONS: Record<Status, Status[]> = {
  PENDING: ["PAID"],
  PAID: ["DELIVERING"],
  DELIVERING: ["COMPLETED"],
  FAILED: [],
  COMPLETED: [],
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
    const nextStatus = String(body.status || "").toUpperCase() as Status;

    if (!ALLOWED_STATUSES.includes(nextStatus)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    /* ===============================
       🔎 LOAD ORDER (ID OR ORDERID)
       =============================== */
    let order = null;

    if (typeof body.id === "string") {
      order = await prisma.order.findUnique({
        where: { id: body.id },
      });
    } else if (typeof body.orderId === "string") {
      order = await prisma.order.findUnique({
        where: { orderId: body.orderId },
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
       ✅ UPDATE STATUS ONLY
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
