import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

// Allowed values must match DB enum exactly
const ALLOWED_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "DELIVERING",
  "COMPLETED",
] as const;

export async function POST(req: NextRequest) {
  try {
    const { reference, status } = await req.json();

    if (!reference || typeof status !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status as any)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    // 🔒 RAW SQL — bypass Prisma enum typing completely
    await prisma.$executeRawUnsafe(
      `
      UPDATE "Order"
      SET "paymentStatus" = $1
      WHERE "reference" = $2
      `,
      status,
      reference
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ update-order-status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
