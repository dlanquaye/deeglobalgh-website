import type {
  WebsiteAllocatedItem,
} from "./websiteOrderAllocation";

export type WebsitePreparedOrderItem = {
  productId: string;
  quantity: number;
};

/**
 * Attach verified supplying-branch allocations to
 * prepared website order items before persistence.
 *
 * This helper:
 * - requires exactly one allocation per product;
 * - rejects extra or missing allocations;
 * - checks that the quantities still match;
 * - preserves prices and other prepared item fields;
 * - never uses client-supplied branch assignments;
 * - does not query or modify a database.
 *
 * The caller must provide server-verified allocations.
 * Legacy POS and older order workflows must not be
 * forced through this new mixed-order helper.
 */
export function prepareAllocatedWebsiteOrderItems<
  T extends WebsitePreparedOrderItem
>(
  preparedItems: readonly T[],
  allocations: readonly WebsiteAllocatedItem[]
): Array<T & { fulfillmentLocationId: string }> {
  if (preparedItems.length === 0) {
    throw new Error("Order must contain items.");
  }

  const allocationByProduct = new Map<
    string,
    WebsiteAllocatedItem
  >();

  for (const allocation of allocations) {
    const productId = allocation.productId.trim();
    const locationId = allocation.locationId.trim();

    if (
      !productId ||
      !locationId ||
      allocation.locationType !== "BRANCH" ||
      !Number.isSafeInteger(allocation.quantity) ||
      allocation.quantity <= 0
    ) {
      throw new Error("Invalid supplying-branch allocation.");
    }

    if (allocationByProduct.has(productId)) {
      throw new Error("Duplicate product allocation.");
    }

    allocationByProduct.set(productId, allocation);
  }

  const seenProducts = new Set<string>();

  const result = preparedItems.map((item) => {
    const productId = item.productId.trim();

    if (
      !productId ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error("Invalid prepared order item.");
    }

    if (seenProducts.has(productId)) {
      throw new Error("Duplicate prepared order product.");
    }

    seenProducts.add(productId);

    const allocation = allocationByProduct.get(productId);

    if (!allocation) {
      throw new Error(
        `Missing supplying-branch allocation for ${productId}.`
      );
    }

    if (allocation.quantity !== item.quantity) {
      throw new Error(
        `Allocation quantity mismatch for ${productId}.`
      );
    }

    return {
      ...item,
      fulfillmentLocationId: allocation.locationId.trim(),
    };
  });

  if (allocationByProduct.size !== seenProducts.size) {
    throw new Error(
      "Unexpected supplying-branch allocations."
    );
  }

  return result;
}