import type { SyncItem } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Enterprise synchronization validation.
 *
 * This validator will gradually become the single
 * source of truth for all synchronization rules.
 */
export function validateSyncItem(
  syncItem: SyncItem
): ValidationResult {

  const errors: string[] = [];

  // UPDATE operations must always have an existing ID.
  if (
    syncItem.action === "UPDATE" &&
    !syncItem.existingId
  ) {
    errors.push("UPDATE operation requires existingId.");
  }

  // Product payload must exist.
  if (!syncItem.product) {
    errors.push("Missing product payload.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}