import { NaccaBookRecord } from "./types";

/**
 * Converts raw NaCCA data into a standard structure.
 *
 * Initially this is a placeholder.
 * It will later support:
 *
 * - CSV
 * - Excel
 * - JSON
 * - NaCCA Registry exports
 */

export function parseNaccaRecords(
  records: unknown[],
): NaccaBookRecord[] {
  return records as NaccaBookRecord[];
}