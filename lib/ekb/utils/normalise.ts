/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * Text Normalisation Utilities
 * ============================================================
 */

export function normaliseText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ");
}

export function equalsNormalised(
  value: string,
  comparison: string,
): boolean {
  return normaliseText(value) === normaliseText(comparison);
}

export function containsNormalised(
  text: string,
  search: string,
): boolean {
  return normaliseText(text).includes(
    normaliseText(search),
  );
}