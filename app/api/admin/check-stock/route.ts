import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sku = searchParams.get("sku");

  if (!sku) {
    return NextResponse.json(
      { error: "Missing sku parameter" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { sku },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    sku: product.sku,
    name: product.name,
    stockQty: product.stockQty,
  });
}
