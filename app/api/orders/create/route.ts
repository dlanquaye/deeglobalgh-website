export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { orderId, customer, amount } = body;

    if (!orderId || !customer || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    await prisma.order.create({
      data: {
        orderId,
        email: customer.email,
        phone: customer.phone,
        amount: amount,
      },
    });

    return NextResponse.json({ ok: true, orderId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
