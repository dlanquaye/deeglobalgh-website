import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 🔒 Admin authentication
    const cookieStore = await cookies();

    const isAdmin = cookieStore.get("dg_admin");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const orderId =
      typeof body.orderId === "string"
        ? body.orderId
        : typeof body.reference === "string"
        ? body.reference
        : null;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order identifier" },
        { status: 400 }
      );
    }

    // 🔒 Resolve to primary Prisma ID
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

    // 🔒 Sanitize inputs
    const deliveryFee =
      typeof body.deliveryFee === "number" && body.deliveryFee >= 0
        ? body.deliveryFee
        : null;

    const adminNotes =
      typeof body.adminNotes === "string"
        ? body.adminNotes.trim()
        : null;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        deliveryFee,
        adminNotes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ update-order-meta error:", error);
    return NextResponse.json(
      { error: "Failed to update order meta" },
      { status: 500 }
    );
  }
}
