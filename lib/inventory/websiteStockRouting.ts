export type WebsiteStockSource =
  | "MAIN_SHOP"
  | "TEXTILES_BRANCH";

export type WebsiteRoutingProduct = {
  sku: string;
  categorySlug: string;
  subCategorySlug?: string | null;
};

export type WebsiteStockAssignments =
  Readonly<Record<string, WebsiteStockSource>>;

/**
 * Return the intended website stock source for a product.
 *
 * Category names do not independently control routing,
 * because boarding essentials can contain both textiles
 * and non-textile products.
 *
 * Assignments must be created from reviewed SKU records.
 *
 * This function does not query or modify inventory.
 */
export function resolveWebsiteStockSource(
  product: WebsiteRoutingProduct,
  assignments: WebsiteStockAssignments
): WebsiteStockSource {
  const sku = product.sku.trim().toUpperCase();

  if (!sku) {
    throw new Error("A valid product SKU is required.");
  }

  const assigned = assignments[sku];

  if (
    assigned === "MAIN_SHOP" ||
    assigned === "TEXTILES_BRANCH"
  ) {
    return assigned;
  }

  if (assigned !== undefined) {
    throw new Error(
      `Invalid website stock assignment for SKU ${sku}`
    );
  }

  // Backward-compatible default.
  // Unassigned products do not automatically move
  // to the new textile branch.
  return "MAIN_SHOP";
}
