/**
 * Product Catalogue Normalisation
 *
 * Converts known catalogue aliases into one canonical identity.
 *
 * IMPORTANT:
 * - This does not modify inventory, pricing, SKU, slug or IDs.
 * - Unknown values are preserved rather than guessed.
 * - Canonical values should represent the underlying product
 *   family/brand identity without automatically appending "Series".
 */

const CANONICAL_BRAND_ALIASES: Record<string, string> = {
  "best brain": "Best Brain",
  "golden": "Golden",
  "wise ant": "Wise Ant",

  "excellence": "Excellence",
  "excellence series": "Excellence",

  "don": "Don",
  "don series": "Don",

  "essential": "Essential",
  "aki ola": "Aki Ola",

  "akrong": "Akrong",
  "akrong series": "Akrong",

  "a plus (a+)": "A Plus (A+)",

  "right hour": "Right Hour",
  "deli": "Deli",
  "generic": "Generic",
};

/**
 * Normalises whitespace and casing for matching purposes only.
 */
function normalizeAliasKey(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * Returns the canonical catalogue brand/series identity.
 *
 * Known aliases are converted to their canonical value.
 * Unknown identities are trimmed and preserved unchanged so
 * legitimate new suppliers or product families are never lost.
 */
export function canonicalizeBrand(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  const key = normalizeAliasKey(trimmed);

  return CANONICAL_BRAND_ALIASES[key] ?? trimmed;
}

/**
 * Applies catalogue normalisation to a product payload without
 * mutating the original object.
 *
 * Additional canonical product fields can be added here as the
 * Standard Catalogue of Truth is rebuilt.
 */
export function normalizeProductCatalogue(
  product: Record<string, unknown>
): Record<string, unknown> {
  const normalized = {
    ...product,
  };

  if ("brand" in normalized) {
    normalized.brand = canonicalizeBrand(normalized.brand);
  }

  return normalized;
}
