import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // ==========================================
    // 1. EXACT SKU LOOKUP
    // ==========================================
    //
    // Hardware barcode scanners behave like
    // keyboards. Our DeeglobalGH labels will
    // encode the existing Product SKU.
    //
    // An exact SKU therefore takes priority over
    // normal text search so a scanned product can
    // be resolved immediately and unambiguously.
    //
    // IMPORTANT:
    // Do not filter websiteVisible here.
    // POS-only products must remain searchable
    // and scannable when isActive = true.
    const exactSkuProduct =
      await prisma.product.findFirst({
        where: {
          isActive: true,
          sku: {
            equals: query,
            mode: "insensitive",
          },
        },
      });

    if (exactSkuProduct) {
      return NextResponse.json([
        exactSkuProduct,
      ]);
    }

    // ==========================================
    // 2. NORMAL POS SEARCH FALLBACK
    // ==========================================
    //
    // Cashiers can continue searching by product
    // name or partial SKU exactly as before.
    const products =
      await prisma.product.findMany({
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
    console.error(
      "POS product search failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}