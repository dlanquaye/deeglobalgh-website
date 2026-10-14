import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { canonicalizeBrand } from "@/lib/product-sync/normalizer";
import type { SyncItem } from "@/lib/product-sync/types";
import { preparePriceImport } from "@/lib/product-sync/price-import";

function optionalText(value: unknown): string | undefined {
  const text = String(value ?? "").trim();

  return text.length > 0 ? text : undefined;
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\bmathematics\b/g, "maths")
    .replace(/\bmath\b/g, "maths")
    .replace(/pupil'?s/g, "")
    .replace(/\btextbook\b/g, "")
    .replace(/\bbook\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Normalises commercial publisher/brand identity.
 *
 * Legal suffixes and harmless punctuation differences should
 * not prevent a genuine same-publisher match:
 *
 * "OCR Investment Ltd"
 * "OCR Investment Limited"
 *
 * But genuinely different publishers must remain distinct.
 */
function normalizeCommercialIdentity(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\blimited\b/g, "")
    .replace(/\bltd\b/g, "")
    .replace(/\bcompany\b/g, "")
    .replace(/\bco\b/g, "")
    .replace(/\bpublishers\b/g, "")
    .replace(/\bpublisher\b/g, "")
    .replace(/\bpublications\b/g, "")
    .replace(/\bpublication\b/g, "")
    .replace(/\bpublishing\b/g, "")
    .replace(/\bpress\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function commercialIdentityMatches(
  incomingPublisher: unknown,
  incomingBrand: unknown,
  existingPublisher: unknown,
  existingBrand: unknown
) {
  const incomingIdentities = new Set(
    [incomingPublisher, incomingBrand]
      .map(normalizeCommercialIdentity)
      .filter(Boolean)
  );

  const existingIdentities = new Set(
    [existingPublisher, existingBrand]
      .map(normalizeCommercialIdentity)
      .filter(Boolean)
  );

  /**
   * A name-only match with no usable publisher/brand identity
   * is unsafe for textbooks and must never trigger UPDATE.
   */
  if (
    incomingIdentities.size === 0 ||
    existingIdentities.size === 0
  ) {
    return false;
  }

  for (const identity of incomingIdentities) {
    if (existingIdentities.has(identity)) {
      return true;
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const session =
      await requireAdmin();

    if (!session.staffId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account is not linked to a staff record.",
        },
        {
          status: 403,
        }
      );
    }

    const staff =
      await prisma.staff.findUnique({
        where: {
          id: session.staffId,
        },
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      });

    if (
      !staff ||
      !staff.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Active staff account required.",
        },
        {
          status: 403,
        }
      );
    }

    const isSuperAdmin =
      session.role ===
      "SUPER_ADMIN";

    const canManageCatalogue =
      isSuperAdmin ||
      staff.role ===
        "MANAGER";

    if (!canManageCatalogue) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to analyse catalogue imports.",
        },
        {
          status: 403,
        }
      );
    }

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

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const firstSheetName =
    workbook.SheetNames[0];

  const worksheet =
    workbook.Sheets[firstSheetName];

  const rows =
    XLSX.utils.sheet_to_json<
      Record<string, unknown>
    >(worksheet, {
      defval: "",
    });

  analysis.totalRows = rows.length;

  const existingProducts =
    await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        imageSrc: true,
        brand: true,
        publisher: true,
      },
    });

  if (importType === "price") {
    const errors: string[] = [];

    const headers = worksheet
      ? XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
          header: 1,
          blankrows: false,
        })[0] ?? []
      : [];

    const headerNames = headers.map((value) =>
      String(value ?? "").trim()
    );

    const allowedHeaders = new Set([
      "SKU",
      "Cost Price",
      "Wholesale Price",
      "Retail Price",
    ]);

    const unexpectedHeaders = headerNames.filter(
      (header) =>
        header &&
        !allowedHeaders.has(header)
    );

    const hasSkuColumn =
      headerNames.includes("SKU");

    const hasCostPriceColumn =
      headerNames.includes("Cost Price");

    const hasWholesalePriceColumn =
      headerNames.includes("Wholesale Price");

    const hasRetailPriceColumn =
      headerNames.includes("Retail Price");

    const hasAtLeastOnePriceColumn =
      hasCostPriceColumn ||
      hasWholesalePriceColumn ||
      hasRetailPriceColumn;

    if (!hasSkuColumn) {
      errors.push(
        'Price import requires a "SKU" column.'
      );
    }

    if (!hasAtLeastOnePriceColumn) {
      errors.push(
        'Price import requires at least one of: "Cost Price", "Wholesale Price", or "Retail Price".'
      );
    }

    if (unexpectedHeaders.length > 0) {
      errors.push(
        `Price import contains unsupported columns: ${unexpectedHeaders.join(
          ", "
        )}.`
      );
    }

    const skuGroups = new Map<
      string,
      typeof existingProducts
    >();

    for (const product of existingProducts) {
      const key =
        product.sku
          ?.trim()
          .toLowerCase();

      if (!key) continue;

      const matches =
        skuGroups.get(key) ?? [];

      matches.push(product);
      skuGroups.set(key, matches);
    }

    const priceRows = rows.map(
      (row, index) => {
        const sku = String(
          row["SKU"] ?? ""
        )
          .trim()
          .toLowerCase();

        if (!sku) {
          errors.push(
            `Row ${index + 2}: SKU is required.`
          );
        }

        const matches =
          skuGroups.get(sku) ?? [];

        if (
          sku &&
          matches.length !== 1
        ) {
          errors.push(
            `Row ${index + 2}: SKU "${sku}" matches ${matches.length} products; exactly one existing product is required.`
          );
        }

        return {
          existingId:
            matches.length === 1
              ? matches[0].id
              : undefined,

          costPrice:
            hasCostPriceColumn
              ? row["Cost Price"]
              : undefined,

          wholesalePrice:
            hasWholesalePriceColumn
              ? row["Wholesale Price"]
              : undefined,

          retailPrice:
            hasRetailPriceColumn
              ? row["Retail Price"]
              : undefined,
        };
      }
    );

    const result =
      preparePriceImport(priceRows);

    errors.push(...result.errors);

    const valid =
      errors.length === 0;

    const syncItems =
      valid
        ? result.syncItems
        : [];

    const mappedPreview =
      rows.map((row, index) => {
        const sku = String(
          row["SKU"] ?? ""
        ).trim();

        const matches =
          skuGroups.get(
            sku.toLowerCase()
          ) ?? [];

        const matchedProduct =
          matches.length === 1
            ? matches[0]
            : undefined;

        return {
          rowNumber: index + 2,
          sku,
          name:
            matchedProduct?.name ??
            "",

          costPrice:
            hasCostPriceColumn
              ? row["Cost Price"]
              : undefined,

          wholesalePrice:
            hasWholesalePriceColumn
              ? row["Wholesale Price"]
              : undefined,

          retailPrice:
            hasRetailPriceColumn
              ? row["Retail Price"]
              : undefined,

          action:
            valid
              ? "UPDATE"
              : "REVIEW",

          matchType:
            matchedProduct
              ? "SKU"
              : "NONE",

          existingId:
            priceRows[index]
              ?.existingId,
        };
      });

    return NextResponse.json({
      success: true,
      analysis: {
        fileName: file.name,
        fileSize: file.size,
        importType: "price",
        status:
          valid
            ? "VALIDATED"
            : "VALIDATION_FAILED",

        totalRows: rows.length,

        validRows:
          valid
            ? rows.length
            : 0,

        invalidRows:
          valid
            ? 0
            : rows.length,

        newProducts: 0,

        existingProducts:
          valid
            ? syncItems.length
            : 0,

        preview: mappedPreview,
        syncItems,
        errors,
      },
    });
  }
  const skuMap = new Map(
    existingProducts
      .filter(
        (product) =>
          product.sku
      )
      .map(
        (product) => [
          product.sku
            .trim()
            .toLowerCase(),
          product,
        ]
      )
  );

  const slugMap = new Map(
    existingProducts
      .filter(
        (product) =>
          product.slug
      )
      .map(
        (product) => [
          product.slug
            .trim()
            .toLowerCase(),
          product,
        ]
      )
  );

  /**
   * One normalised title may legitimately belong to several
   * publishers. Therefore the map stores an ARRAY of products,
   * not one product per name.
   */
  const nameMap = new Map<
    string,
    typeof existingProducts
  >();

  for (
    const product
    of existingProducts
  ) {
    if (!product.name) {
      continue;
    }

    const key =
      normalizeName(
        product.name
      );

    if (!key) {
      continue;
    }

    const existing =
      nameMap.get(key) ?? [];

    existing.push(product);

    nameMap.set(
      key,
      existing
    );
  }

  const preview =
    rows.map((row) => {
      const sku =
        String(
          row["SKU"] ?? ""
        )
          .trim()
          .toLowerCase();

      const slug =
        String(
          row["Slug"] ?? ""
        )
          .trim()
          .toLowerCase();

      const productName =
        String(
          row["Product Name"] ?? ""
        ).trim();

      const incomingBrand =
        canonicalizeBrand(
          row["Brand"]
        );

      const incomingPublisher =
        optionalText(
          row["Publisher"]
        );

      const matchedSkuProduct =
        skuMap.get(sku);

      const matchedSlugProduct =
        !matchedSkuProduct
          ? slugMap.get(slug)
          : undefined;

      const normalizedName =
        normalizeName(
          productName
        );

      const sameNameCandidates =
        !matchedSkuProduct &&
        !matchedSlugProduct
          ? (
              nameMap.get(
                normalizedName
              ) ?? []
            )
          : [];

      /**
       * CRITICAL SAFETY RULE
       *
       * NAME fallback may update only when the commercial
       * publisher/brand identity also agrees.
       *
       * Therefore:
       *
       * "Creative Arts for Primary Schools - Basic 4"
       * OCR Investment Ltd
       *
       * and
       *
       * "Creative Arts for Primary Schools - Basic 4"
       * Design Ghana Publications
       *
       * are separate products.
       */
      const matchedNameProduct =
        sameNameCandidates.find(
          (product) =>
            commercialIdentityMatches(
              incomingPublisher,
              incomingBrand,
              product.publisher,
              product.brand
            )
        );

      const matchedProduct =
        matchedSkuProduct ??
        matchedSlugProduct ??
        matchedNameProduct;

      const matchType =
        matchedSkuProduct
          ? "SKU"
          : matchedSlugProduct
            ? "SLUG"
            : matchedNameProduct
              ? "NAME+PUBLISHER"
              : "NEW";

      return {
        sku:
          String(
            row["SKU"] ?? ""
          ),

        productName,

        category:
          String(
            row["Category Slug"] ??
              ""
          ),

        brand:
          incomingBrand,

        publisher:
          incomingPublisher,

        author:
          optionalText(
            row["Author"]
          ),

        retailPrice:
          row["Retail Price"],

        action:
          matchedProduct
            ? "UPDATE"
            : "INSERT",

        matchType,

        existingId:
          matchedProduct?.id,
      };
    });

  const mappedPreview =
    preview.map(
      (item, index) => {
        const row =
          rows[index];

        return {
          sku:
            String(
              row["SKU"] ?? ""
            ).trim(),

          name:
            String(
              row[
                "Product Name"
              ] ?? ""
            ).trim(),

          slug:
            String(
              row["Slug"] ?? ""
            ).trim(),

          retailPrice:
            Number(
              row[
                "Retail Price"
              ] ?? 0
            ),

          wholesalePrice:
            Number(
              row[
                "Wholesale Price"
              ] ?? 0
            ),

          distributorPrice:
            Number(
              row[
                "Distributor Price"
              ] ?? 0
            ),

          categorySlug:
            String(
              row[
                "Category Slug"
              ] ?? ""
            ).trim(),

          subCategorySlug:
            String(
              row[
                "Subcategory Slug"
              ] ?? ""
            ).trim(),

          levelSlugs:
            String(
              row[
                "Level Slugs"
              ] ?? ""
            )
              .split(",")
              .map(
                (value) =>
                  value.trim()
              )
              .filter(Boolean),

          brand:
            canonicalizeBrand(
              row["Brand"]
            ),

          publisher:
            optionalText(
              row["Publisher"]
            ),

          author:
            optionalText(
              row["Author"]
            ),

          imageSrc:
            String(
              row[
                "Image Src"
              ] ?? ""
            ).trim(),

          imageAlt:
            String(
              row[
                "Image Alt"
              ] ?? ""
            ).trim(),

          imageTitle:
            String(
              row[
                "Image Title"
              ] ?? ""
            ).trim(),

          imageCaption:
            String(
              row[
                "Image Caption"
              ] ?? ""
            ).trim(),

          imageDescription:
            String(
              row[
                "Image Description"
              ] ?? ""
            ).trim(),

          focusKeyphrase:
            String(
              row[
                "Focus Keyphrase"
              ] ?? ""
            ).trim(),

          metaTitle:
            String(
              row[
                "Meta Title"
              ] ?? ""
            ).trim(),

          metaDescription:
            String(
              row[
                "Meta Description"
              ] ?? ""
            ).trim(),

          socialTitle:
            String(
              row[
                "Social Title"
              ] ?? ""
            ).trim(),

          socialDescription:
            String(
              row[
                "Social Description"
              ] ?? ""
            ).trim(),

          shortSummary:
            String(
              row[
                "Short Summary"
              ] ?? ""
            ).trim(),

          fullDescription:
            String(
              row[
                "Full Description"
              ] ?? ""
            ).trim(),

          tags:
            String(
              row["Tags"] ?? ""
            )
              .split(",")
              .map(
                (value) =>
                  value.trim()
              )
              .filter(Boolean),

          costPrice:
            Number(
              row[
                "Cost Price"
              ] ?? 0
            ),

          stockQty:
            Number(
              row[
                "Stock Quantity"
              ] ?? 0
            ),

          isActive:
            String(
              row[
                "Is Active"
              ] ?? "TRUE"
            )
              .trim()
              .toUpperCase() ===
            "TRUE",

          websiteVisible:
            String(
              row[
                "Website Visible"
              ] ?? "TRUE"
            )
              .trim()
              .toUpperCase() ===
            "TRUE",

          action:
            item.action,

          matchType:
            item.matchType,

          existingId:
            item.existingId,
        };
      }
    );

  const requiredColumns = [
    "Product Name",
    "SKU",
    "Category Slug",
    "Brand",
    "Retail Price",
  ];

  if (rows.length > 0) {
    const headers =
      Object.keys(
        rows[0]
      );

    const missingColumns =
      requiredColumns.filter(
        (column) =>
          !headers.includes(
            column
          )
      );

    if (
      missingColumns.length >
      0
    ) {
      analysis.errors.push(
        `Missing required columns: ${missingColumns.join(", ")}`
      );
    }
  }

  const duplicateSkuMap =
    new Map<string, number>();

  for (const row of rows) {
    const sku =
      String(
        row["SKU"] ?? ""
      ).trim();

    if (!sku) {
      continue;
    }

    duplicateSkuMap.set(
      sku,
      (
        duplicateSkuMap.get(
          sku
        ) ?? 0
      ) + 1
    );
  }

  analysis.duplicateSkus =
    [
      ...duplicateSkuMap.values(),
    ].filter(
      (count) =>
        count > 1
    ).length;

  if (
    analysis.duplicateSkus >
    0
  ) {
    analysis.errors.push(
      `${analysis.duplicateSkus} duplicate SKU(s) found.`
    );
  }

  const duplicateSlugMap =
    new Map<string, number>();

  for (const row of rows) {
    const slug =
      String(
        row["Slug"] ?? ""
      )
        .trim()
        .toLowerCase();

    if (!slug) {
      continue;
    }

    duplicateSlugMap.set(
      slug,
      (
        duplicateSlugMap.get(
          slug
        ) ?? 0
      ) + 1
    );
  }

  analysis.duplicateSlugs =
    [
      ...duplicateSlugMap.values(),
    ].filter(
      (count) =>
        count > 1
    ).length;

  if (
    analysis.duplicateSlugs >
    0
  ) {
    analysis.errors.push(
      `${analysis.duplicateSlugs} duplicate slug(s) found.`
    );
  }

  analysis.validRows =
    analysis.errors.length ===
    0
      ? analysis.totalRows
      : 0;

  analysis.invalidRows =
    analysis.totalRows -
    analysis.validRows;

  const isValid =
    analysis.errors.length ===
    0;

  const syncItems: SyncItem[] =
    mappedPreview.map(
      (item) => ({
        action:
          item.action as SyncItem["action"],

        existingId:
          item.existingId,

        product: {
          sku:
            item.sku,

          name:
            item.name,

          slug:
            item.slug,

          retailPrice:
            item.retailPrice,

          wholesalePrice:
            item.wholesalePrice,

          distributorPrice:
            item.distributorPrice,

          categorySlug:
            item.categorySlug,

          subCategorySlug:
            item.subCategorySlug,

          levelSlugs:
            item.levelSlugs,

          brand:
            item.brand,

          publisher:
            item.publisher,

          author:
            item.author,

          imageSrc:
            item.imageSrc,

          imageAlt:
            item.imageAlt,

          imageTitle:
            item.imageTitle,

          imageCaption:
            item.imageCaption,

          imageDescription:
            item.imageDescription,

          focusKeyphrase:
            item.focusKeyphrase,

          metaTitle:
            item.metaTitle,

          metaDescription:
            item.metaDescription,

          socialTitle:
            item.socialTitle,

          socialDescription:
            item.socialDescription,

          shortSummary:
            item.shortSummary,

          fullDescription:
            item.fullDescription,

          tags:
            item.tags,

          costPrice:
            item.costPrice,

          stockQty:
            item.stockQty,

          isActive:
            item.isActive,

          websiteVisible:
            item.websiteVisible,
        },
      })
    );

  /**
   * Analysis totals MUST reflect the actual action decisions.
   * Do not derive these totals from SKU existence alone.
   */
  const actualNewProducts =
    syncItems.filter(
      (item) =>
        item.action ===
        "INSERT"
    );

  const actualExistingProducts =
    syncItems.filter(
      (item) =>
        item.action ===
        "UPDATE"
    );
return NextResponse.json({
    success: true,

    analysis: {
      fileName:
        file.name,

      fileSize:
        file.size,

      importType,

      status:
        isValid
          ? "VALIDATED"
          : "VALIDATION_FAILED",

      newProducts:
        actualNewProducts.length,

      existingProducts:
        actualExistingProducts.length,

      preview:
        mappedPreview,

      syncItems,

      ...analysis,
    },
  });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "CredentialChangeRequired"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Credential change required.",
        },
        {
          status: 403,
        }
      );
    }

    console.error(
      "Catalogue analysis failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to analyse catalogue.",
      },
      {
        status: 500,
      }
    );
  }
}
