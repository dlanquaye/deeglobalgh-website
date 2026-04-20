export const runtime = "nodejs"; // ✅ VERY IMPORTANT

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";
import { parse } from "csv-parse/sync";

type CsvRow = Record<string, string>;

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const text = await file.text();

    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
    }) as CsvRow[]; // ✅ FIX TYPES

    const createdProducts = [];

    for (const row of records) {
      const product = await prisma.product.create({
        data: {
          sku: row["SKU"],
          name: row["Product Name"],
          slug: row["Slug"],
          brand: row["Brand"] || null,

          retailPrice: Number(row["Retail Price"]),
          wholesalePrice: row["Wholesale Price"]
            ? Number(row["Wholesale Price"])
            : null,
          distributorPrice: row["Distributor Price"]
            ? Number(row["Distributor Price"])
            : null,

          stockQty: Number(row["Stock Qty"] || 0),
          lowStockThreshold: Number(row["Low Stock Threshold"] || 3),

          categorySlug: row["Category Slug"],
          levelSlugs: row["Level Slugs"]
            ? row["Level Slugs"].split(",")
            : [],

          imageSrc: row["Image Src"],
          imageAlt: row["Image Alt"],
          imageTitle: row["Image Title"] || null,
          imageCaption: row["Image Caption"] || null,
          imageDescription: row["Image Description"] || null,

          focusKeyphrase: row["Focus Keyphrase"] || null,
          metaTitle: row["Meta Title"] || null,
          metaDescription: row["Meta Description"] || null,
          socialTitle: row["Social Title"] || null,
          socialDescription: row["Social Description"] || null,

          shortSummary: row["Short Summary"] || null,
          fullDescription: row["Full Description"] || null,

          tags: row["Tags"]
            ? row["Tags"].split(",").map((t) => t.trim())
            : [],
        },
      });

      // ✅ AUTO CREATE INVENTORY FOR KASOA
await prisma.inventory.create({
  data: {
    productId: product.id,
    locationType: "BRANCH",
    locationId: "shop-kasoa",
    quantity: Number(row["Stock Qty"] || 0),
  },
});

      createdProducts.push(product);
    }

    return NextResponse.json({
      success: true,
      count: createdProducts.length,
    });
  } catch (error: any) {
    console.error("❌ BULK UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Bulk upload failed" },
      { status: 500 }
    );
  }
}