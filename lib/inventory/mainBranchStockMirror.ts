import { LocationType } from "@prisma/client";

/**
 * DeeGlobalGH's established main retail branch.
 *
 * Product.stockQty is a legacy compatibility mirror
 * of this branch's authoritative Inventory quantity.
 *
 * Inventory at other branches and warehouses must
 * never overwrite this value.
 */
export const DEEGLOBALGH_MAIN_BRANCH_ID =
  "cmq4b407s0000g3jg31elgm80";

/**
 * Returns true only for the established main branch.
 *
 * Does not access or modify the database.
 */
export function isMainBranchStockMirrorLocation(
  locationType: LocationType,
  locationId: string
): boolean {
  return (
    locationType === LocationType.BRANCH &&
    locationId === DEEGLOBALGH_MAIN_BRANCH_ID
  );
}