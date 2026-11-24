export type PersistedWebsiteOrderItem = {
  id: string;
  productId: string;
  quantity: number;
  fulfillmentLocationId?: string | null;
};

export type ResolvedWebsiteOrderItem = {
  orderItemId: string;
  productId: string;
  quantity: number;
  locationType: "BRANCH";
  locationId: string;
};

/**
 * Resolve the recorded fulfilment branch for each order item.
 *
 * Legacy orders:
 * All items lack fulfillmentLocationId.
 * Every item uses the historical Order.locationId.
 *
 * New orders:
 * Every item has its own fulfillmentLocationId.
 * The historical Order.locationId does not override it.
 *
 * Partially allocated orders are rejected, not guessed.
 *
 * IMPORTANT:
 * This is a pure local helper, not a database integration.
 * The proposed OrderItem field does not exist yet.
 * The caller must load persisted values from trusted
 * server-side records, never from the customer's request.
 */
export function resolvePersistedWebsiteOrderLocations(
  orderLocationId: string | null | undefined,
  items: readonly PersistedWebsiteOrderItem[]
): ResolvedWebsiteOrderItem[] {
  if (items.length === 0) {
    throw new Error("Order has no items.");
  }

  const hasExplicit = items.map(
    (item) => item.fulfillmentLocationId != null
  );

  const explicitCount = hasExplicit.filter(Boolean).length;

  if (
    explicitCount > 0 &&
    explicitCount !== items.length
  ) {
    throw new Error(
      "Order has incomplete item-level allocations."
    );
  }

  const legacy = explicitCount === 0;
  const legacyLocation = orderLocationId?.trim();

  if (legacy && !legacyLocation) {
    throw new Error(
      "Legacy order has no supplying branch."
    );
  }

  const seenOrderItemIds = new Set<string>();

  return items.map((item) => {
    const orderItemId = item.id.trim();
    const productId = item.productId.trim();

    if (!orderItemId || !productId) {
      throw new Error(
        "Invalid persisted order item identity."
      );
    }

    if (seenOrderItemIds.has(orderItemId)) {
      throw new Error(
        "Duplicate persisted order item ID."
      );
    }

    seenOrderItemIds.add(orderItemId);

    if (
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error(
        "Invalid persisted order item quantity."
      );
    }

    const locationId = legacy
      ? legacyLocation
      : item.fulfillmentLocationId?.trim();

    if (!locationId) {
      throw new Error(
        "Order item has no valid supplying branch."
      );
    }

    return {
      orderItemId,
      productId,
      quantity: item.quantity,
      locationType: "BRANCH",
      locationId,
    };
  });
}
