export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { PaymentStatus } from "@prisma/client";

export async function GET() {
  try {
    /* ===============================
       📅 TODAY RANGE
    =============================== */
    const now = new Date();

const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0);

const todayEnd = new Date(now);
todayEnd.setHours(23, 59, 59, 999);

    /* ===============================
       📊 FETCH ORDERS DIRECTLY
    =============================== */
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    /* ===============================
       📈 CALCULATIONS
    =============================== */
    const totalOrders = orders.length;

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === PaymentStatus.COMPLETED)
      .reduce((sum, o) => sum + o.amount, 0);

    const processingCount = orders.filter(
      (o) => o.paymentStatus === PaymentStatus.DELIVERING
    ).length;

    const deliveredCount = orders.filter(
      (o) => o.paymentStatus === PaymentStatus.COMPLETED
    ).length;

    const cancelledCount = orders.filter(
      (o) => o.paymentStatus === PaymentStatus.CANCELLED
    ).length;

    const message = `📊 DeeglobalGh Daily Report

🧾 Orders: ${totalOrders}
💰 Revenue: GHS ${totalRevenue}
🚚 Delivering: ${processingCount}
✅ Completed: ${deliveredCount}
❌ Cancelled: ${cancelledCount}`;

    console.log("📊 DAILY REPORT:");
    console.log(message);

    /* ===============================
       📲 WHATSAPP LINK
    =============================== */
    const phone = "233246011773";

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    return NextResponse.json({
      success: true,
      message,
      whatsappUrl,
    });

  } catch (error) {
    console.error("CRON DAILY REPORT ERROR:", error);

    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500 }
    );
  }
}