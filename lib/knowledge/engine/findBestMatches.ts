import {
  buildEducationalFingerprint,
} from "./buildEducationalFingerprint";

import {
  compareFingerprints,
} from "./compareFingerprints";

import {
  EducationalFingerprint,
} from "./types";

export interface ProductMatchCandidate {
  id: string;
  sku: string;
  productName: string;
  retailPrice: number;
  stockQty: number;
  fingerprint?: EducationalFingerprint;
}

export interface ProductMatchResult {
  product: ProductMatchCandidate;
  similarity: number;
  matchingDimensions: string[];
  differentDimensions: string[];
  missingDimensions: string[];
}

/**
 * Convenience wrapper.
 * Accepts a product name and delegates to the
 * fingerprint-based matcher.
 */
export function findBestMatches(
  requestedProductName: string,
  catalogue: ProductMatchCandidate[],
  limit = 5
): ProductMatchResult[] {
  const fingerprint =
    buildEducationalFingerprint(requestedProductName);

  return findBestMatchesByFingerprint(
    fingerprint,
    catalogue,
    limit
  );
}

/**
 * Production matcher.
 * Accepts an Educational Fingerprint directly.
 */
export function findBestMatchesByFingerprint(
  requestedFingerprint: EducationalFingerprint,
  catalogue: ProductMatchCandidate[],
  limit = 5
): ProductMatchResult[] {
  const matches: ProductMatchResult[] = catalogue.map((product) => {
    const fingerprint =
      product.fingerprint ??
      buildEducationalFingerprint(product.productName);

    const comparison = compareFingerprints(
      requestedFingerprint,
      fingerprint
    );
    console.log("------------------------------------------------");
console.log("Requested:", requestedFingerprint);

console.log("Product:", product.productName);

console.log("Fingerprint Used:", fingerprint);

console.log("Comparison:", comparison);

    return {
      product,
      similarity: comparison.similarity,
      matchingDimensions: comparison.matchingDimensions,
      differentDimensions: comparison.differentDimensions,
      missingDimensions: comparison.missingDimensions,
    };
  });

  return matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}