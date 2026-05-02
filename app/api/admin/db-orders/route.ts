export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
  orderBy: {
    createdAt: "desc",
  },
  include: {
  orderItems: {
    include: {
      product: true, // 👈 THIS IS KEY
    },
  },
},
});

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to load orders:", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
