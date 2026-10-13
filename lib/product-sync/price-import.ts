import type { SyncItem } from "./types";

export interface PriceImportRow {
  existingId?: string;
  retailPrice: unknown;
}

export interface PriceImportResult {
  valid: boolean;
  syncItems: SyncItem[];
  errors: string[];
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

    const rawPrice = row.retailPrice;

    if (
      rawPrice === null ||
      rawPrice === undefined ||
      (typeof rawPrice === "string" &&
        rawPrice.trim() === "")
    ) {
      errors.push(
        `Row ${rowNumber}: Retail price is required.`
      );
      return;
    }

    const retailPrice = Number(rawPrice);

    if (
      !Number.isFinite(retailPrice) ||
      retailPrice <= 0 ||
      Math.round(retailPrice * 100) !==
        retailPrice * 100
    ) {
      errors.push(
        `Row ${rowNumber}: Invalid retail price.`
      );
      return;
    }

    syncItems.push({
      action: "UPDATE",
      existingId,
      product: {
        retailPrice,
      },
    });
  });

  return {
    valid: errors.length === 0,
    syncItems:
      errors.length === 0 ? syncItems : [],
    errors,
  };
}
