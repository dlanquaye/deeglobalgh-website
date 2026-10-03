import { EDITABLE_FIELDS } from "./governance";
import { normalizeProductCatalogue } from "./normalizer";
import type { SyncItem } from "./types";

/**
 * Builds a Prisma UPDATE payload containing only
 * fields that are approved by governance.
 *
 * Catalogue normalisation is applied before governance filtering
 * so known aliases cannot be reintroduced through another caller.
 */
export function buildProductUpdate(syncItem: SyncItem) {
  const normalizedProduct =
    normalizeProductCatalogue(syncItem.product);

  const updateData: Record<string, unknown> = {};

  for (const field of EDITABLE_FIELDS) {
    const value = normalizedProduct[field];

    if (value !== undefined) {
      updateData[field] = value;
    }
  }

  return updateData;
}

/**
 * Builds a Prisma CREATE payload.
 *
 * Catalogue normalisation is applied at the final write boundary
 * so newly created products also use canonical identities.
 *
 * Governance rules for CREATE will be expanded later.
 */
export function buildProductCreate(syncItem: SyncItem) {
  return normalizeProductCatalogue(syncItem.product);
}
