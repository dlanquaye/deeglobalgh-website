import type { SyncItem } from "./types";

export interface PriceImportRow {
  existingId?: string;
  costPrice?: unknown;
  wholesalePrice?: unknown;
  retailPrice?: unknown;
}

export interface PriceImportResult {
  valid: boolean;
  syncItems: SyncItem[];
  errors: string[];
}

type CommercialPriceField =
  | "costPrice"
  | "wholesalePrice"
  | "retailPrice";

type CommercialPriceUpdate = Partial<
  Record<CommercialPriceField, number>
>;

function isBlank(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" &&
      value.trim() === "")
  );
}

function parseOptionalPrice({
  value,
  label,
  rowNumber,
  errors,
}: {
  value: unknown;
  label: string;
  rowNumber: number;
  errors: string[];
}): number | undefined {
  if (isBlank(value)) {
    return undefined;
  }

  const numericValue = Number(value);

  if (
    !Number.isFinite(numericValue) ||
    numericValue <= 0 ||
    Math.round(numericValue * 100) !==
      numericValue * 100
  ) {
    errors.push(
      `Row ${rowNumber}: Invalid ${label.toLowerCase()}.`
    );

    return undefined;
  }

  return numericValue;
}

export function preparePriceImport(
  rows: PriceImportRow[]
): PriceImportResult {
  const syncItems: SyncItem[] = [];
  const errors: string[] = [];
  const seenIds = new Set<string>();

  if (rows.length === 0) {
    errors.push("Price import contains no products.");
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    const existingId =
      typeof row.existingId === "string"
        ? row.existingId.trim()
        : "";

    if (!existingId) {
      errors.push(
        `Row ${rowNumber}: Existing product match required.`
      );
      return;
    }

    if (seenIds.has(existingId)) {
      errors.push(
        `Row ${rowNumber}: Duplicate product in price import.`
      );
      return;
    }

    seenIds.add(existingId);

    const rowErrorCountBefore =
      errors.length;

    const costPrice = parseOptionalPrice({
      value: row.costPrice,
      label: "Cost Price",
      rowNumber,
      errors,
    });

    const wholesalePrice = parseOptionalPrice({
      value: row.wholesalePrice,
      label: "Wholesale Price",
      rowNumber,
      errors,
    });

    const retailPrice = parseOptionalPrice({
      value: row.retailPrice,
      label: "Retail Price",
      rowNumber,
      errors,
    });

    if (
      errors.length >
      rowErrorCountBefore
    ) {
      return;
    }

    const product: CommercialPriceUpdate = {};

    if (costPrice !== undefined) {
      product.costPrice = costPrice;
    }

    if (wholesalePrice !== undefined) {
      product.wholesalePrice =
        wholesalePrice;
    }

    if (retailPrice !== undefined) {
      product.retailPrice =
        retailPrice;
    }

    if (
      Object.keys(product).length === 0
    ) {
      errors.push(
        `Row ${rowNumber}: At least one of Cost Price, Wholesale Price, or Retail Price is required.`
      );
      return;
    }

    syncItems.push({
      action: "UPDATE",
      existingId,
      product,
    });
  });

  return {
    valid: errors.length === 0,
    syncItems:
      errors.length === 0 ? syncItems : [],
    errors,
  };
}
