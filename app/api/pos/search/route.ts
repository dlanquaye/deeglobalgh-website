import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
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
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("POS product search failed:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}