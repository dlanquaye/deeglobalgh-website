import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

// Allowed statuses (must match schema.prisma enum exactly)
const ALLOWED_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "DELIVERING",
  "COMPLETED",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function POST(req: NextRequest) {
  try {
    const { reference, status } = await req.json();

    if (!reference || typeof status !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { reference },
      data: {
        paymentStatus: status as AllowedStatus,
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
