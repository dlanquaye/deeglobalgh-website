export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { PaymentStatus } from "@prisma/client";

export async function GET() {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    /* ===============================
       📊 GET TODAY ORDERS
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

    /* ===============================
       📤 MESSAGE
    =============================== */
    const message = `📊 DeeglobalGh Daily Report

🧾 Orders: ${totalOrders}
💰 Revenue: GHS ${totalRevenue}
🚚 Delivering: ${processingCount}
✅ Completed: ${deliveredCount}
❌ Cancelled: ${cancelledCount}`;

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      processingCount,
      deliveredCount,
      cancelledCount,
      message,
    });

  } catch (error) {
    console.error("DAILY REPORT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}