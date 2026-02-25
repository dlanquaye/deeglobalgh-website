import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { PaymentStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    /* ===============================
       🔒 ADMIN AUTH
       =============================== */
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

    /* ===============================
       🔎 LOAD ORDER WITH STATUS
       =============================== */
    const order = await prisma.order.findUnique({
      where: { orderId },
      select: {
        id: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ===============================
       🔒 LOCK FINANCIAL FIELDS
       =============================== */
    const isFinanciallyLocked =
      order.paymentStatus === PaymentStatus.PAID ||
      order.paymentStatus === PaymentStatus.DELIVERING ||
      order.paymentStatus === PaymentStatus.COMPLETED;

    const updateData: {
      deliveryFee?: number | null;
      adminNotes?: string | null;
    } = {};

    // ✅ Admin notes always allowed
    if (typeof body.adminNotes === "string") {
      updateData.adminNotes = body.adminNotes.trim();
    }

    // ❌ deliveryFee blocked if locked
    if (!isFinanciallyLocked) {
      if (
        typeof body.deliveryFee === "number" &&
        body.deliveryFee >= 0
      ) {
        updateData.deliveryFee = body.deliveryFee;
      }
    } else {
      if (typeof body.deliveryFee === "number") {
        return NextResponse.json(
          {
            error:
              "Delivery fee cannot be modified after payment is confirmed",
          },
          { status: 403 }
        );
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
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
