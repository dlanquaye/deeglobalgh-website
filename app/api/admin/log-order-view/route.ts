import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("dg_admin");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const { orderId, reason } = await req.json();

    if (!orderId || !reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Reason required (minimum 5 characters)" },
        { status: 400 }
      );
    }

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

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        adminId: session.id,
        eventType: "VIEWED",
        description: reason.trim(),
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Log order view error:", error);

    return NextResponse.json(
      { error: "Failed to log event" },
      { status: 500 }
    );
  }
}
