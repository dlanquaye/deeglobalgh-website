export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const lowStockProducts =
      await prisma.product.findMany({
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
    console.error(
      "❌ low-stock error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch low stock products",
      },
      {
        status: 500,
      }
    );
  }
}
