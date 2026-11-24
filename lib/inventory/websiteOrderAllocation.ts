import {
  resolveWebsiteStockSource,
  type WebsiteStockAssignments,
} from "./websiteStockRouting";

export type WebsiteAllocationItem = {
  productId: string;
  sku: string;
  categorySlug: string;
  subCategorySlug?: string | null;
  quantity: number;
};

export type WebsiteAllocationLocations = {
  mainBranchId: string;
  textilesBranchId?: string | null;
  verifiedBranchIds: readonly string[];
};

export type WebsiteAllocatedItem = {
  productId: string;
  sku: string;
  quantity: number;
  locationType: "BRANCH";
  locationId: string;
};

function requireVerifiedBranch(
  locationId: string | null | undefined,
  verifiedBranchIds: readonly string[]
): string {
  const id = locationId?.trim();

  if (!id) {
    throw new Error(
      "Required website supplying branch is not configured."
    );
  }

  if (!verifiedBranchIds.includes(id)) {
    throw new Error(
      "Website supplying branch has not been verified."
    );
  }

  return id;
}

/**
 * Prepare item-level website stock allocations.
 *
 * IMPORTANT:
 * - No database operations occur here.
 * - verifiedBranchIds must be supplied by a trusted,
 *   authenticated server-side branch lookup.
 * - Client-submitted locations must never be trusted.
 * - Stock availability must be checked separately.
 * - This does not reserve or deduct inventory.
 */
export function planWebsiteOrderAllocations(
  items: readonly WebsiteAllocationItem[],
  assignments: WebsiteStockAssignments,
  locations: WebsiteAllocationLocations
): WebsiteAllocatedItem[] {
  if (!items.length) {
    throw new Error("Order must contain at least one item.");
  }

  const mainBranchId = requireVerifiedBranch(
    locations.mainBranchId,
    locations.verifiedBranchIds
  );

  const seenProductIds = new Set<string>();

  return items.map((item) => {
    const productId = item.productId.trim();
    const sku = item.sku.trim().toUpperCase();

    if (!productId || !sku) {
      throw new Error(
        "Every order item requires a product ID and SKU."
      );
    }

    if (
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error(
        `Invalid order quantity for ${sku}.`
      );
    }

    if (seenProductIds.has(productId)) {
      throw new Error(
        `Duplicate product in order: ${sku}.`
      );
    }

    seenProductIds.add(productId);

    const source = resolveWebsiteStockSource(
      {
        sku,
        categorySlug: item.categorySlug,
        subCategorySlug: item.subCategorySlug,
      },
      assignments
    );

    const locationId =
      source === "TEXTILES_BRANCH"
        ? requireVerifiedBranch(
            locations.textilesBranchId,
            locations.verifiedBranchIds
          )
        : mainBranchId;

    return {
      productId,
      sku,
      quantity: item.quantity,
      locationType: "BRANCH",
      locationId,
    };
  });
}
