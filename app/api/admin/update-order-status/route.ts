import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

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
    // 🔒 Admin auth
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("dg_admin");

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const status = String(body.status || "").toUpperCase();

    if (!ALLOWED_STATUSES.includes(status as any)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // ✅ CASE 1: Prisma primary key sent (this is your current UI)
    if (typeof body.id === "string") {
      await prisma.order.update({
        where: { id: body.id },
        data: { paymentStatus: status as any },
      });

      return NextResponse.json({ success: true });
    }

    // ✅ CASE 2: orderId sent (fallback / legacy)
    if (typeof body.orderId === "string") {
      const order = await prisma.order.findUnique({
        where: { orderId: body.orderId },
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
        data: { paymentStatus: status as any },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Missing order identifier" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ update-order-status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
