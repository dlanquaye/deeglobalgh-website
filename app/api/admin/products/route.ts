import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      sku,
      name,
      slug,
      retailPrice,
      stockQty,
      categorySlug,
      levelSlugs,
      imageSrc,
      imageAlt,
      tags,
    } = body;

    if (
      !sku ||
      !name ||
      !slug ||
      !categorySlug ||
      !imageSrc ||
      !imageAlt
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        slug,
        retailPrice: Number(retailPrice),
        stockQty: Number(stockQty),
        categorySlug,
        levelSlugs: levelSlugs ?? [],
        imageSrc,
        imageAlt,
        tags: tags ?? [],
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}