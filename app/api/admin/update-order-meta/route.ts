export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, deliveryFee, adminNotes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { orderId },
      data: {
        deliveryFee:
          typeof deliveryFee === "number" ? deliveryFee : null,
        adminNotes:
          typeof adminNotes === "string" ? adminNotes : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
