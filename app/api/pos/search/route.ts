import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
  contains: query,
  mode: "insensitive",
},
        isActive: true, // ✅ only active products
      },
      take: 10,
    });
console.log("SEARCH:", query);
console.log("RESULTS:", products.length);

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}