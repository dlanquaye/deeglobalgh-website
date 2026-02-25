export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
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

    /* ===============================
       📉 FETCH LOW STOCK PRODUCTS
       =============================== */
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockQty: {
          lte: prisma.product.fields.lowStockThreshold,
        },
      },
      orderBy: {
        stockQty: "asc",
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQty: true,
        lowStockThreshold: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: lowStockProducts.length,
      products: lowStockProducts,
    });

  } catch (error) {
    console.error("❌ low-stock error:", error);

    return NextResponse.json(
      { error: "Failed to fetch low stock products" },
      { status: 500 }
    );
  }
}
