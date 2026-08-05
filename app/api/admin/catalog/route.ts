import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import type { SyncItem } from "@/lib/product-sync/types";

function optionalText(value: unknown): string | undefined {
  const text = String(value ?? "").trim();

  return text.length > 0 ? text : undefined;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const importType = formData.get("importType");

  const analysis = {
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    duplicateSkus: 0,
    duplicateSlugs: 0,
    missingImages: 0,
    missingCategories: 0,
    missingBrands: 0,
    missingLevels: 0,
    warnings: [] as string[],
    errors: [] as string[],
  };

  if (!file) {
    return NextResponse.json(
      {
        success: false,
        error: "No file uploaded.",
      },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  analysis.totalRows = rows.length;

  const existingProducts = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      slug: true,
      name: true,
      imageSrc: true,
    },
  });

  const skuMap = new Map(
    existingProducts
      .filter((product) => product.sku)
      .map((product) => [product.sku.trim().toLowerCase(), product])
  );

  const slugMap = new Map(
    existingProducts
      .filter((product) => product.slug)
      .map((product) => [product.slug.trim().toLowerCase(), product])
  );

  const nameMap = new Map(
    existingProducts
      .filter((product) => product.name)
      .map((product) => [product.name.trim().toLowerCase(), product])
  );

  const newProducts = rows.filter((row) => {
    const sku = String(row["SKU"] ?? "").trim().toLowerCase();

    return !skuMap.has(sku);
  });

  const existingProductSkus = rows.filter((row) => {
    const sku = String(row["SKU"] ?? "").trim().toLowerCase();

    return skuMap.has(sku);
  });

  function normalizeName(name: string) {
    return name
      .toLowerCase()
      .replace(/mathematics/g, "maths")
      .replace(/math/g, "maths")
      .replace(/pupil'?s/g, "")
      .replace(/textbook/g, "")
      .replace(/book/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }

  const preview = rows.map((row) => {
    const sku = String(row["SKU"] ?? "").trim().toLowerCase();
    const slug = String(row["Slug"] ?? "").trim().toLowerCase();

    const matchedSkuProduct = skuMap.get(sku);

    const matchedSlugProduct = !matchedSkuProduct
      ? slugMap.get(slug)
      : undefined;

    const productName = String(row["Product Name"] ?? "").trim();
    const normalizedName = normalizeName(productName);

    const matchedNameProduct =
      !matchedSkuProduct && !matchedSlugProduct
        ? [...nameMap.entries()].find(
            ([name]) => normalizeName(name) === normalizedName
          )?.[1]
        : undefined;

    const matchedProduct =
      matchedSkuProduct ?? matchedSlugProduct ?? matchedNameProduct;

    const matchType = matchedSkuProduct
      ? "SKU"
      : matchedSlugProduct
        ? "SLUG"
        : matchedNameProduct
          ? "NAME"
          : "NEW";

    return {
      sku: String(row["SKU"] ?? ""),
      productName,
      category: String(row["Category Slug"] ?? ""),
      brand: String(row["Brand"] ?? ""),
      publisher: optionalText(row["Publisher"]),
      author: optionalText(row["Author"]),
      retailPrice: row["Retail Price"],
      action: matchedProduct ? "UPDATE" : "INSERT",
      matchType,
      existingId: matchedProduct?.id,
    };
  });

  const mappedPreview = preview.map((item, index) => {
    const row = rows[index];

    return {
      sku: String(row["SKU"] ?? "").trim(),
      name: String(row["Product Name"] ?? "").trim(),
      slug: String(row["Slug"] ?? "").trim(),

      retailPrice: Number(row["Retail Price"] ?? 0),
      wholesalePrice: Number(row["Wholesale Price"] ?? 0),
      distributorPrice: Number(row["Distributor Price"] ?? 0),

      categorySlug: String(row["Category Slug"] ?? "").trim(),
      subCategorySlug: String(row["Subcategory Slug"] ?? "").trim(),

      levelSlugs: String(row["Level Slugs"] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),

      brand: String(row["Brand"] ?? "").trim(),

      publisher: optionalText(row["Publisher"]),
      author: optionalText(row["Author"]),

      imageSrc: String(row["Image Src"] ?? "").trim(),
      imageAlt: String(row["Image Alt"] ?? "").trim(),
      imageTitle: String(row["Image Title"] ?? "").trim(),
      imageCaption: String(row["Image Caption"] ?? "").trim(),
      imageDescription: String(row["Image Description"] ?? "").trim(),

      focusKeyphrase: String(row["Focus Keyphrase"] ?? "").trim(),
      metaTitle: String(row["Meta Title"] ?? "").trim(),
      metaDescription: String(row["Meta Description"] ?? "").trim(),
      socialTitle: String(row["Social Title"] ?? "").trim(),
      socialDescription: String(row["Social Description"] ?? "").trim(),

      shortSummary: String(row["Short Summary"] ?? "").trim(),
      fullDescription: String(row["Full Description"] ?? "").trim(),

      tags: String(row["Tags"] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),

      costPrice: Number(row["Cost Price"] ?? 0),
      stockQty: Number(row["Stock Quantity"] ?? 0),

      isActive:
  String(row["Is Active"] ?? "TRUE").trim().toUpperCase() === "TRUE",

websiteVisible:
  String(row["Website Visible"] ?? "TRUE").trim().toUpperCase() === "TRUE",

      action: item.action,
      matchType: item.matchType,
      existingId: item.existingId,
    };
  });

  const requiredColumns = [
    "Product Name",
    "SKU",
    "Category Slug",
    "Brand",
    "Retail Price",
  ];

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);

    const missingColumns = requiredColumns.filter(
      (column) => !headers.includes(column)
    );

    if (missingColumns.length > 0) {
      analysis.errors.push(
        `Missing required columns: ${missingColumns.join(", ")}`
      );
    }
  }

  const duplicateSkuMap = new Map<string, number>();

  for (const row of rows) {
    const sku = String(row["SKU"] ?? "").trim();

    if (!sku) {
      continue;
    }

    duplicateSkuMap.set(sku, (duplicateSkuMap.get(sku) ?? 0) + 1);
  }

  analysis.duplicateSkus = [...duplicateSkuMap.values()].filter(
    (count) => count > 1
  ).length;

  if (analysis.duplicateSkus > 0) {
    analysis.errors.push(
      `${analysis.duplicateSkus} duplicate SKU(s) found.`
    );
  }

  const duplicateSlugMap = new Map<string, number>();

  for (const row of rows) {
    const slug = String(row["Slug"] ?? "").trim().toLowerCase();

    if (!slug) {
      continue;
    }

    duplicateSlugMap.set(slug, (duplicateSlugMap.get(slug) ?? 0) + 1);
  }

  analysis.duplicateSlugs = [...duplicateSlugMap.values()].filter(
    (count) => count > 1
  ).length;

  if (analysis.duplicateSlugs > 0) {
    analysis.errors.push(
      `${analysis.duplicateSlugs} duplicate slug(s) found.`
    );
  }

  analysis.validRows =
    analysis.errors.length === 0 ? analysis.totalRows : 0;

  analysis.invalidRows = analysis.totalRows - analysis.validRows;

  const isValid = analysis.errors.length === 0;

  console.log({
    fileName: file.name,
    fileSize: file.size,
    importType,
  });

  console.log({
    existing: existingProductSkus.length,
    newProducts: newProducts.length,
    newProductList: newProducts.map((row) => ({
      sku: row["SKU"],
      futureSku: row["Future SKU"],
      name: row["Product Name"],
      publisher: row["Publisher"],
      author: row["Author"],
    })),
  });

  const syncItems: SyncItem[] = mappedPreview.map((item) => ({
    action: item.action as SyncItem["action"],
    existingId: item.existingId,
    product: {
      sku: item.sku,
      name: item.name,
      slug: item.slug,

      retailPrice: item.retailPrice,
      wholesalePrice: item.wholesalePrice,
      distributorPrice: item.distributorPrice,

      categorySlug: item.categorySlug,
      subCategorySlug: item.subCategorySlug,
      levelSlugs: item.levelSlugs,

      brand: item.brand,
      publisher: item.publisher,
      author: item.author,

      imageSrc: item.imageSrc,
      imageAlt: item.imageAlt,
      imageTitle: item.imageTitle,
      imageCaption: item.imageCaption,
      imageDescription: item.imageDescription,

      focusKeyphrase: item.focusKeyphrase,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      socialTitle: item.socialTitle,
      socialDescription: item.socialDescription,

      shortSummary: item.shortSummary,
      fullDescription: item.fullDescription,

      tags: item.tags,

      costPrice: item.costPrice,
      stockQty: item.stockQty,

      isActive: item.isActive,
websiteVisible: item.websiteVisible,
    },
  }));

  console.log({
    syncItems: syncItems.length,
    updates: syncItems.filter((item) => item.action === "UPDATE").length,
    inserts: syncItems.filter((item) => item.action === "INSERT").length,
    reviews: syncItems.filter((item) => item.action === "REVIEW").length,
  });

  return NextResponse.json({
    success: true,

    analysis: {
      fileName: file.name,
      fileSize: file.size,
      importType,
      status: isValid ? "VALIDATED" : "VALIDATION_FAILED",

      newProducts: newProducts.length,
      existingProducts: existingProductSkus.length,

      preview: mappedPreview,
      syncItems,

      ...analysis,
    },
  });
}