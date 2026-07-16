/**
 * Normalises product names before classification.
 */
export function normaliseText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
}