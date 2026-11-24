import type {
  WebsiteAllocatedItem,
} from "./websiteOrderAllocation";

export type WebsiteStockRecord = {
  productId: string;
  locationType: "BRANCH" | "WAREHOUSE";
  locationId: string;
  quantity: number;
};

export type WebsiteStockValidationResult = {
  productId: string;
  locationId: string;
  requestedQuantity: number;
  availableQuantity: number;
};

function stockKey(
  productId: string,
  locationType: string,
  locationId: string
): string {
  return JSON.stringify([
    productId,
    locationType,
    locationId,
  ]);
}

/**
 * Validate planned website items against the exact
 * inventory records for their supplying branches.
 *
 * Missing inventory is treated as zero stock.
 *
 * This is a pure validation function:
 * - It does not query the database.
 * - It does not reserve or deduct stock.
 * - It does not read Product.stockQty.
 * - Final payment processing must recheck stock
 *   atomically inside its database transaction.
 */
export function validateWebsiteAllocationStock(
  allocations: readonly WebsiteAllocatedItem[],
  inventoryRecords: readonly WebsiteStockRecord[]
): WebsiteStockValidationResult[] {
  if (allocations.length === 0) {
    throw new Error("An order must contain items.");
  }

  const inventoryByKey = new Map<string, number>();

  for (const record of inventoryRecords) {
    if (
      !record.productId.trim() ||
      !record.locationId.trim() ||
      (record.locationType !== "BRANCH" &&
        record.locationType !== "WAREHOUSE") ||
      !Number.isSafeInteger(record.quantity) ||
      record.quantity < 0
    ) {
      throw new Error("Invalid inventory record.");
    }

    const key = stockKey(
      record.productId,
      record.locationType,
      record.locationId
    );

    if (inventoryByKey.has(key)) {
      throw new Error("Duplicate inventory location record.");
    }

    inventoryByKey.set(key, record.quantity);
  }

  const seenProducts = new Set<string>();

  return allocations.map((item) => {
    if (
      !item.productId.trim() ||
      !item.locationId.trim() ||
      item.locationType !== "BRANCH" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error("Invalid website order allocation.");
    }

    if (seenProducts.has(item.productId)) {
      throw new Error(
        "Duplicate product allocation is not permitted."
      );
    }

    seenProducts.add(item.productId);

    const key = stockKey(
      item.productId,
      item.locationType,
      item.locationId
    );

    const availableQuantity =
      inventoryByKey.get(key) ?? 0;

    if (availableQuantity < item.quantity) {
      throw new Error(
        `Insufficient stock at allocated branch for ${item.sku}.`
      );
    }

    return {
      productId: item.productId,
      locationId: item.locationId,
      requestedQuantity: item.quantity,
      availableQuantity,
    };
  });
}
