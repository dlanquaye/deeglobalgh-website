import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getOrderAmountGhs } from "@/lib/pos/orderMoney";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const reportDate = searchParams.get("date");

  if (!reportDate) {
    return NextResponse.json(
      {
        error: "Report date is required",
      },
      {
        status: 400,
      }
    );
  }

  const startOfDay = new Date(reportDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(reportDate);
  endOfDay.setHours(23, 59, 59, 999);

  const sales = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const totalSales = sales.reduce(
    (sum, sale) =>
      sum + getOrderAmountGhs(sale),
    0
  );

  const cashSales = sales
    .filter(
      (sale) =>
        sale.paymentMethod === "CASH"
    )
    .reduce(
      (sum, sale) =>
        sum + getOrderAmountGhs(sale),
      0
    );

  const mobileMoneySales = sales
    .filter(
      (sale) =>
        sale.paymentMethod === "MOMO"
    )
    .reduce(
      (sum, sale) =>
        sum + getOrderAmountGhs(sale),
      0
    );

  const bankTransferSales = sales
    .filter(
      (sale) =>
        sale.paymentMethod ===
        "BANK_TRANSFER"
    )
    .reduce(
      (sum, sale) =>
        sum + getOrderAmountGhs(sale),
      0
    );

  const onlineCardSales = sales
    .filter(
      (sale) =>
        sale.paymentMethod ===
        "ONLINE_CARD"
    )
    .reduce(
      (sum, sale) =>
        sum + getOrderAmountGhs(sale),
      0
    );

  return NextResponse.json({
    sales,
    totalOrders: sales.length,
    totalSales,
    cashSales,
    mobileMoneySales,
    bankTransferSales,
    onlineCardSales,
  });
}
