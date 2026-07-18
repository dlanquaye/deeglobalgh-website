import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("query")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
      take: 10,
      select: {
        id: true,
        sku: true,
        name: true,
        retailPrice: true,
        stockQty: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search products.",
      },
      {
        status: 500,
      }
    );
  }
}