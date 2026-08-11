export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { LocationType } from "@prisma/client";
import * as XLSX from "xlsx";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";

type AdminSession = {
  adminId?: string;
  staffId?: string | null;
  branchId?: string | null;
  role?: string;
  staffName?: string | null;
};

type SpreadsheetRow = Record<string, unknown>;

type NormalisedImportItem = {
  rowNumber: number;

  productId: string;
  sku: string;
  productName: string;

  current: {
  costPrice: number | null;
  retailPrice: number | null;
  wholesalePrice: number | null;
  distributorPrice: number | null;
  stockQty: number;
};

  target: {
    costPrice?: number;
    retailPrice?: number;
    wholesalePrice?: number;
    distributorPrice?: number;
    stockQty?: number;
  };

  stockDelta?: number;

  changes: string[];

  action: "UPDATE" | "NO_CHANGE";
};

const REQUIRED_COLUMNS = [
  "SKU",
] as const;

const SUPPORTED_COLUMNS = [
  "SKU",
  "Cost Price",
  "Retail Price",
  "Wholesale Price",
  "Distributor Price",
  "Opening Stock",
] as const;

function isBlank(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  );
}

function normaliseSku(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function parseOptionalPrice(
  value: unknown,
  label: string
):
  | {
      value?: number;
      error?: undefined;
    }
  | {
      value?: undefined;
      error: string;
    } {
  if (isBlank(value)) {
    return {};
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return {
      error: `${label} must be a valid number greater than or equal to 0`,
    };
  }

  return {
    value: parsed,
  };
}

function parseOptionalOpeningStock(
  value: unknown
):
  | {
      value?: number;
      error?: undefined;
    }
  | {
      value?: undefined;
      error: string;
    } {
  if (isBlank(value)) {
    return {};
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 0
  ) {
    return {
      error:
        "Opening Stock must be a whole number greater than or equal to 0",
    };
  }

  return {
    value: parsed,
  };
}

export async function POST(
  req: NextRequest
) {
  try {
    // ==============================
    // AUTHENTICATION / BRANCH
    // ==============================
    const session =
      (await requireAdmin()) as AdminSession;

    if (!session.branchId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No branch is assigned to this account",
        },
        { status: 400 }
      );
    }

    // ==============================
    // FILE
    // ==============================
    const formData =
      await req.formData();

    const file =
      formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded",
        },
        { status: 400 }
      );
    }

    const fileName =
      file.name.toLowerCase();

    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls") &&
      !fileName.endsWith(".csv")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "File must be an Excel or CSV file",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const workbook = XLSX.read(
      buffer,
      {
        type: "buffer",
      }
    );

    const firstSheetName =
      workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The spreadsheet contains no worksheets",
        },
        { status: 400 }
      );
    }

    const worksheet =
      workbook.Sheets[firstSheetName];

    // ==============================
    // HEADERS
    // ==============================
    const matrix =
      XLSX.utils.sheet_to_json<unknown[]>(
        worksheet,
        {
          header: 1,
          defval: "",
        }
      );

    const headers = (
      matrix[0] ?? []
    ).map((value) =>
      String(value ?? "").trim()
    );

    const missingRequiredColumns =
      REQUIRED_COLUMNS.filter(
        (column) =>
          !headers.includes(column)
      );

    if (
      missingRequiredColumns.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required column(s): ${missingRequiredColumns.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const rows =
      XLSX.utils.sheet_to_json<SpreadsheetRow>(
        worksheet,
        {
          defval: "",
        }
      );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The spreadsheet contains no data rows",
        },
        { status: 400 }
      );
    }

    // ==============================
    // DUPLICATE SKU CHECK
    // ==============================
    const skuCounts =
      new Map<string, number>();

    for (const row of rows) {
      const sku =
        normaliseSku(row["SKU"]);

      if (!sku) {
        continue;
      }

      skuCounts.set(
        sku,
        (skuCounts.get(sku) ?? 0) + 1
      );
    }

    const duplicateSkus =
      [...skuCounts.entries()]
        .filter(
          ([, count]) => count > 1
        )
        .map(([sku]) => sku);

    // ==============================
    // LOAD PRODUCT MASTER
    // ==============================
    const products =
      await prisma.product.findMany({
        select: {
          id: true,
          sku: true,
          name: true,

          costPrice: true,
          retailPrice: true,
          wholesalePrice: true,
          distributorPrice: true,
        },
      });

    const productBySku =
      new Map(
        products
          .filter(
            (product) => product.sku
          )
          .map((product) => [
            product.sku!
              .trim()
              .toLowerCase(),
            product,
          ])
      );

    // ==============================
    // MATCH PRODUCT IDS
    // ==============================
    const matchedProductIds =
      new Set<string>();

    for (const row of rows) {
      const sku =
        normaliseSku(row["SKU"]);

      const product =
        productBySku.get(sku);

      if (product) {
        matchedProductIds.add(
          product.id
        );
      }
    }

    // ==============================
    // LOAD BRANCH INVENTORY
    // ==============================
    const inventoryRows =
      matchedProductIds.size > 0
        ? await prisma.inventory.findMany({
            where: {
              productId: {
                in: [
                  ...matchedProductIds,
                ],
              },
              locationType:
                LocationType.BRANCH,
              locationId:
                session.branchId,
            },
            select: {
              productId: true,
              quantity: true,
            },
          })
        : [];

    const inventoryByProductId =
      new Map(
        inventoryRows.map(
          (inventory) => [
            inventory.productId,
            inventory.quantity,
          ]
        )
      );

    // ==============================
    // ANALYSE ROWS
    // ==============================
    const errors: string[] = [];
    const warnings: string[] = [];

    const invalidRowNumbers =
      new Set<number>();

    const preview:
      NormalisedImportItem[] = [];

    const syncItems:
      NormalisedImportItem[] = [];

    if (
      duplicateSkus.length > 0
    ) {
      errors.push(
        `Duplicate SKU(s) found: ${duplicateSkus.join(
          ", "
        )}`
      );
    }

    rows.forEach(
      (row, index) => {
        const rowNumber =
          index + 2;

        const rawSku =
          String(
            row["SKU"] ?? ""
          ).trim();

        const sku =
          normaliseSku(rawSku);

        const rowErrors:
          string[] = [];

        // --------------------------
        // SKU
        // --------------------------
        if (!sku) {
          rowErrors.push(
            "SKU is required"
          );
        }

        if (
          sku &&
          duplicateSkus.includes(sku)
        ) {
          rowErrors.push(
            "Duplicate SKU in spreadsheet"
          );
        }

        const product =
          sku
            ? productBySku.get(sku)
            : undefined;

        if (
          sku &&
          !product
        ) {
          rowErrors.push(
            `SKU not found in catalogue: ${rawSku}`
          );
        }

        // --------------------------
        // PRICE VALUES
        // --------------------------
        const costPrice =
          parseOptionalPrice(
            row["Cost Price"],
            "Cost Price"
          );

        const retailPrice =
          parseOptionalPrice(
            row["Retail Price"],
            "Retail Price"
          );

        const wholesalePrice =
          parseOptionalPrice(
            row["Wholesale Price"],
            "Wholesale Price"
          );

        const distributorPrice =
          parseOptionalPrice(
            row[
              "Distributor Price"
            ],
            "Distributor Price"
          );

        const openingStock =
          parseOptionalOpeningStock(
            row["Opening Stock"]
          );

        for (const result of [
          costPrice,
          retailPrice,
          wholesalePrice,
          distributorPrice,
          openingStock,
        ]) {
          if (result.error) {
            rowErrors.push(
              result.error
            );
          }
        }

        // --------------------------
        // INVENTORY EXISTENCE
        // --------------------------
        if (product) {
          const hasInventory =
            inventoryByProductId.has(
              product.id
            );

          if (!hasInventory) {
            rowErrors.push(
              `Branch inventory record not found for ${product.name}`
            );
          }
        }

        if (
          rowErrors.length > 0
        ) {
          invalidRowNumbers.add(
            rowNumber
          );

          for (
            const rowError of rowErrors
          ) {
            errors.push(
              `Row ${rowNumber}: ${rowError}`
            );
          }

          return;
        }

        if (!product) {
          return;
        }

        const currentStock =
          inventoryByProductId.get(
            product.id
          ) ?? 0;

        const changes: string[] =
          [];

        if (
          costPrice.value !==
            undefined &&
          costPrice.value !==
            product.costPrice
        ) {
          changes.push(
            `Cost Price: ${product.costPrice} → ${costPrice.value}`
          );
        }

        if (
          retailPrice.value !==
            undefined &&
          retailPrice.value !==
            product.retailPrice
        ) {
          changes.push(
            `Retail Price: ${product.retailPrice} → ${retailPrice.value}`
          );
        }

        if (
          wholesalePrice.value !==
            undefined &&
          wholesalePrice.value !==
            product.wholesalePrice
        ) {
          changes.push(
            `Wholesale Price: ${product.wholesalePrice} → ${wholesalePrice.value}`
          );
        }

        if (
          distributorPrice.value !==
            undefined &&
          distributorPrice.value !==
            product.distributorPrice
        ) {
          changes.push(
            `Distributor Price: ${product.distributorPrice} → ${distributorPrice.value}`
          );
        }

        let stockDelta:
          | number
          | undefined;

        if (
          openingStock.value !==
          undefined
        ) {
          stockDelta =
            openingStock.value -
            currentStock;

          if (stockDelta !== 0) {
            changes.push(
              `Branch Stock: ${currentStock} → ${openingStock.value} (${stockDelta > 0 ? "+" : ""}${stockDelta})`
            );
          }
        }

        const item:
          NormalisedImportItem =
          {
            rowNumber,

            productId:
              product.id,

            sku:
              product.sku ??
              rawSku,

            productName:
              product.name,

            current: {
              costPrice:
                product.costPrice,

              retailPrice:
                product.retailPrice,

              wholesalePrice:
                product.wholesalePrice,

              distributorPrice:
                product.distributorPrice,

              stockQty:
                currentStock,
            },

            target: {
              ...(costPrice.value !==
              undefined
                ? {
                    costPrice:
                      costPrice.value,
                  }
                : {}),

              ...(retailPrice.value !==
              undefined
                ? {
                    retailPrice:
                      retailPrice.value,
                  }
                : {}),

              ...(wholesalePrice.value !==
              undefined
                ? {
                    wholesalePrice:
                      wholesalePrice.value,
                  }
                : {}),

              ...(distributorPrice.value !==
              undefined
                ? {
                    distributorPrice:
                      distributorPrice.value,
                  }
                : {}),

              ...(openingStock.value !==
              undefined
                ? {
                    stockQty:
                      openingStock.value,
                  }
                : {}),
            },

            ...(stockDelta !==
            undefined
              ? {
                  stockDelta,
                }
              : {}),

            changes,

            action:
              changes.length > 0
                ? "UPDATE"
                : "NO_CHANGE",
          };

        preview.push(item);

        if (
          item.action === "UPDATE"
        ) {
          syncItems.push(item);
        }
      }
    );

    // ==============================
    // SUMMARY
    // ==============================
    const invalidRows =
      invalidRowNumbers.size;

    const validRows =
      rows.length - invalidRows;

    const updateRows =
      preview.filter(
        (item) =>
          item.action === "UPDATE"
      ).length;

    const noChangeRows =
      preview.filter(
        (item) =>
          item.action ===
          "NO_CHANGE"
      ).length;

    const priceChangeRows =
      preview.filter((item) =>
        item.changes.some(
          (change) =>
            change.startsWith(
              "Cost Price:"
            ) ||
            change.startsWith(
              "Retail Price:"
            ) ||
            change.startsWith(
              "Wholesale Price:"
            ) ||
            change.startsWith(
              "Distributor Price:"
            )
        )
      ).length;

    const stockChangeRows =
      preview.filter(
        (item) =>
          item.stockDelta !==
            undefined &&
          item.stockDelta !== 0
      ).length;

    if (
      headers.some(
        (header) =>
          header &&
          !SUPPORTED_COLUMNS.includes(
            header as (typeof SUPPORTED_COLUMNS)[number]
          )
      )
    ) {
      warnings.push(
        "The file contains extra columns. They will be ignored."
      );
    }

    const isValid =
      errors.length === 0;

    return NextResponse.json({
      success: true,

      analysis: {
        status: isValid
          ? "VALIDATED"
          : "VALIDATION_FAILED",

        fileName: file.name,
        fileSize: file.size,

        branchId:
          session.branchId,

        totalRows:
          rows.length,

        validRows,
        invalidRows,

        updateRows,
        noChangeRows,

        priceChangeRows,
        stockChangeRows,

        duplicateSkus:
          duplicateSkus.length,

        errors,
        warnings,

        preview,

        syncItems:
          isValid
            ? syncItems
            : [],
      },
    });
  } catch (error) {
    console.error(
      "Opening Stock & Price analysis error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to analyse Opening Stock & Price file";

    if (
      message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to analyse Opening Stock & Price file",
      },
      { status: 500 }
    );
  }
}