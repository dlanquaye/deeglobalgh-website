import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { reference, deliveryFee, adminNotes } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Missing order reference" },
        { status: 400 }
      );
    }

    // Use raw SQL to bypass Prisma Client type lag
    await prisma.$executeRawUnsafe(
      `
      UPDATE "Order"
      SET
        "deliveryFee" = $1,
        "adminNotes" = $2
      WHERE "reference" = $3
      `,
      typeof deliveryFee === "number" ? deliveryFee : null,
      typeof adminNotes === "string" ? adminNotes : null,
      reference
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ update-order-meta error:", error);
    return NextResponse.json(
      { error: "Failed to update order meta" },
      { status: 500 }
    );
  }
}
