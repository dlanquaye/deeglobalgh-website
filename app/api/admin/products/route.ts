import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";

// ✅ Slug generator (fallback only)
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export async function POST(req: Request) {
  // 🔐 Admin protection
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const {
      sku,
      name,
      slug, // ✅ ACCEPT SLUG FROM USER
      retailPrice,
      wholesalePrice,
      distributorPrice,
      stockQty,
      lowStockThreshold,
      categorySlug,
      levelSlugs,
      imageSrc,
      imageAlt,
      imageTitle,
      imageCaption,
      imageDescription,
      focusKeyphrase,
      metaTitle,
      metaDescription,
      socialTitle,
      socialDescription,
      shortSummary,
      fullDescription,
      brand,
      tags,
    } = body;

    // ✅ Required fields
    if (!sku || !name || !categorySlug || !imageSrc || !imageAlt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parsedStockQty = Number(stockQty ?? 0);
    const parsedLowStock = Number(lowStockThreshold ?? 3);

    console.log("🧪 STOCK RECEIVED:", stockQty);
    console.log("🧪 STOCK PARSED:", parsedStockQty);

    // ✅ FIXED SLUG LOGIC (CRITICAL)
    const finalSlug = slug ? slug : slugify(name);

    const product = await prisma.product.create({
      data: {
        // Core
        sku,
        name,
        slug: finalSlug, // ✅ USE FIXED SLUG

        retailPrice: Number(retailPrice),
        wholesalePrice: wholesalePrice
          ? Number(wholesalePrice)
          : null,
        distributorPrice: distributorPrice
          ? Number(distributorPrice)
          : null,

        stockQty: parsedStockQty,
        lowStockThreshold: parsedLowStock,

        categorySlug,
        levelSlugs: levelSlugs ?? [],

        // Image
        imageSrc,
        imageAlt,
        imageTitle: imageTitle ?? null,
        imageCaption: imageCaption ?? null,
        imageDescription: imageDescription ?? null,

        // SEO
        focusKeyphrase: focusKeyphrase ?? null,
        metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null,
        socialTitle: socialTitle ?? null,
        socialDescription: socialDescription ?? null,

        // Content
        shortSummary: shortSummary ?? null,
        fullDescription: fullDescription ?? null,

        // Other
        brand: brand ?? null,
        tags: tags ?? [],
      },
    });

    console.log("✅ PRODUCT CREATED WITH STOCK:", product.stockQty);

    // ✅ AUTO CREATE INVENTORY FOR KASOA
    await prisma.inventory.create({
      data: {
        productId: product.id,
        locationType: "BRANCH",
        locationId: "shop-kasoa",
        quantity: parsedStockQty,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("❌ CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
// ✅ GET ALL PRODUCTS WITH STOCK (FOR ADMIN DASHBOARD)
export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stockQty: true,
        lowStockThreshold: true,
        costPrice: true, // ✅ ADD THIS
        supplier: true, // 👈 ADD THIS
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized or server error" },
      { status: 500 }
    );
  }
}