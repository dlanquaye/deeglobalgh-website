import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    

    const { searchParams } = new URL(req.url);

const reportDate = searchParams.get("date");

if (!reportDate) {
  return NextResponse.json(
    { error: "Report date is required" },
    { status: 400 }
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
  (sum, sale) => sum + Number(sale.amount),
  0
);

const cashSales = sales
  .filter((sale) => sale.paymentMethod === "Cash")
  .reduce((sum, sale) => sum + Number(sale.amount), 0);

  const mobileMoneySales = sales
  .filter((sale) => sale.paymentMethod === "Mobile Money")
  .reduce((sum, sale) => sum + Number(sale.amount), 0);

  const bankTransferSales = sales
  .filter((sale) => sale.paymentMethod === "Bank Transfer")
  .reduce((sum, sale) => sum + Number(sale.amount), 0);

  const onlineCardSales = sales
  .filter((sale) => sale.paymentMethod === "Online Card")
  .reduce((sum, sale) => sum + Number(sale.amount), 0);

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