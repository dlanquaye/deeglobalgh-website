export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderId: true,
        reference: true,
        phone: true,
        email: true,
        amount: true,
        paymentStatus: true,
        smsSent: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
