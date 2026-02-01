import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

const ALLOWED_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "DELIVERING",
  "COMPLETED",
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const orderId =
      typeof body.id === "string"
        ? body.id
        : typeof body.orderId === "string"
        ? body.orderId
        : null;

    const status = String(body.status || "").toUpperCase();

    if (!orderId || !ALLOWED_STATUSES.includes(status as any)) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    // 🔒 Resolve human orderId → internal Prisma id
    const order = await prisma.order.findUnique({
      where: { orderId },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: status as any,
      },
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
