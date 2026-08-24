import {
  CoordinatedProductMatchResult,
  EducationalProductMatchCoordinator,
} from "@/lib/estimator/EducationalProductMatchCoordinator";

import {
  buildEducationalFingerprint,
} from "@/lib/knowledge/engine/buildEducationalFingerprint";

import {
  EducationalFingerprint,
} from "@/lib/knowledge/engine/types";

export interface SchoolListMatch {
  originalLine: string;

  matchedProductId?: string;

  matchedProductName?: string;

  similarity: number;
}

const MINIMUM_ACCEPTED_SIMILARITY =
  60;

const MAXIMUM_CANDIDATES_TO_REVIEW =
  25;

const BLOCKING_DIFFERENT_DIMENSIONS =
  new Set<string>([
    "subject",
    "level",
    "publisher",
    "resource",
  ]);

const educationalProductMatchCoordinator =
  new EducationalProductMatchCoordinator();

function hasExplicitLevel(
  value: string
): boolean {
  return (
    /\bkg\s*[- ]?\s*[12]\b/i.test(
      value
    ) ||
    /\b(?:kindergarten|kindertgen)\s*[- ]?\s*[12]\b/i.test(
      value
    ) ||
    /\bnursery\s*[- ]?\s*[12]\b/i.test(
      value
    ) ||
    /\bbasic\s*[- ]?\s*[1-9]\b/i.test(
      value
    ) ||
    /\bprimary\s*[- ]?\s*[1-9]\b/i.test(
      value
    ) ||
    /\bjhs\s*[- ]?\s*[1-3]\b/i.test(
      value
    ) ||
    /\bjunior\s+high\s*(?:school)?\s*[- ]?\s*[1-3]\b/i.test(
      value
    ) ||
    /\bshs\s*[- ]?\s*[1-3]\b/i.test(
      value
    ) ||
    /\bsenior\s+high\s*(?:school)?\s*[- ]?\s*[1-3]\b/i.test(
      value
    )
  );
}

function buildMatchingLine(
  originalLine: string,
  documentLevelContext?: string
): string {
  const context =
    documentLevelContext?.trim();

  if (!context) {
    return originalLine;
  }

  if (
    hasExplicitLevel(
      originalLine
    )
  ) {
    return originalLine;
  }

  return `${originalLine} ${context}`;
}

/*
 * Normalise free-text identity wording for narrow
 * title/series safety checks.
 *
 * This is deliberately separate from the educational
 * fingerprint engine. It is used only to protect
 * explicit customer identity wording that is otherwise
 * absent from structured dimensions.
 */
function normaliseIdentityText(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/*
 * Some school lists contain an explicit named book
 * family / identity that is not currently represented
 * by publisher, subject, resource or level dimensions.
 *
 * Example:
 *
 *   Unique Field Comprehension KG2
 *
 * A candidate such as:
 *
 *   Akontaa for Kindergarten 2A - KG 2
 *
 * must not be accepted merely because KG2 matches.
 *
 * This guard is intentionally narrow. It only protects
 * known explicit identity phrases that have already
 * produced unsafe substitutions in real estimator UAT.
 */
function hasExplicitIdentityConflict(
  requestedLine: string,
  candidateProductName: string
): boolean {
  const requested =
    normaliseIdentityText(
      requestedLine
    );

  const candidate =
    normaliseIdentityText(
      candidateProductName
    );

  const explicitIdentityPhrases = [
    "unique field",
  ];

  for (
    const identity
    of explicitIdentityPhrases
  ) {
    if (
      requested.includes(
        identity
      ) &&
      !candidate.includes(
        identity
      )
    ) {
      return true;
    }
  }

  return false;
}

function isAcceptableMatch(
  match: CoordinatedProductMatchResult,
  requestedFingerprint: EducationalFingerprint,
  requestedLine: string
): boolean {
  if (
    match.similarity <
    MINIMUM_ACCEPTED_SIMILARITY
  ) {
    return false;
  }

  const hasBlockingDifference =
    match.differentDimensions.some(
      (dimension) =>
        BLOCKING_DIFFERENT_DIMENSIONS.has(
          dimension
        )
    );

  if (
    hasBlockingDifference
  ) {
    return false;
  }

  const requestedPublisherIsExplicit =
    Boolean(
      requestedFingerprint.publisher
    );

  const candidatePublisherEvidenceMissing =
    match.missingDimensions.includes(
      "publisher"
    );

  if (
    requestedPublisherIsExplicit &&
    candidatePublisherEvidenceMissing
  ) {
    return false;
  }

  /*
   * Protect explicit title/series identity wording
   * that is not represented in structured fingerprint
   * dimensions.
   */
  if (
    hasExplicitIdentityConflict(
      requestedLine,
      match.product.productName
    )
  ) {
    return false;
  }

  return true;
}

export async function matchSchoolList(
  lines: string[],
  documentLevelContext?: string
): Promise<SchoolListMatch[]> {
  const results:
    SchoolListMatch[] = [];

  for (
    const line of lines
  ) {
    const matchingLine =
      buildMatchingLine(
        line,
        documentLevelContext
      );

    const requestedFingerprint =
      buildEducationalFingerprint(
        matchingLine
      );

    const matches =
      await educationalProductMatchCoordinator.findBestMatches(
        matchingLine,
        MAXIMUM_CANDIDATES_TO_REVIEW
      );

    const bestMatch =
      matches.find(
        (match) =>
          isAcceptableMatch(
            match,
            requestedFingerprint,
            matchingLine
          )
      );

    if (
      !bestMatch
    ) {
      results.push({
        originalLine:
          line,

        similarity:
          0,
      });

      continue;
    }

    results.push({
      originalLine:
        line,

      matchedProductId:
        bestMatch.product.id,

      matchedProductName:
        bestMatch.product.productName,

      similarity:
        bestMatch.similarity,
    });
  }

  return results;
}