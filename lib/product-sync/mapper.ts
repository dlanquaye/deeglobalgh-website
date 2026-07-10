import { EDITABLE_FIELDS } from "./governance";
import type { SyncItem } from "./types";

/**
 * Builds a Prisma UPDATE payload containing only
 * fields that are approved by governance.
 */
export function buildProductUpdate(syncItem: SyncItem) {
  const updateData: Record<string, unknown> = {};

  for (const field of EDITABLE_FIELDS) {
    const value = syncItem.product[field];

    if (value !== undefined) {
      updateData[field] = value;
    }
  }

  return updateData;
}

/**
 * Builds a Prisma CREATE payload.
 *
 * Currently returns the incoming product unchanged.
 * Governance rules for CREATE will be expanded later.
 */
export function buildProductCreate(syncItem: SyncItem) {
  return {
    ...syncItem.product,
  };
}