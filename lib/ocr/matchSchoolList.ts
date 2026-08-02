import {
  CoordinatedProductMatchResult,
  EducationalProductMatchCoordinator,
} from "@/lib/estimator/EducationalProductMatchCoordinator";

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

/*
 * A match must never be accepted when both fingerprints
 * identify conflicting core educational information.
 *
 * Examples:
 *
 * York versus Best Brain
 * Basic 4 versus Basic 1
 * Workbook versus Textbook
 * Computing versus Mathematics
 */
const BLOCKING_DIFFERENT_DIMENSIONS =
  new Set<string>([
    "subject",
    "level",
    "publisher",
    "resource",
  ]);

const educationalProductMatchCoordinator =
  new EducationalProductMatchCoordinator();

function isAcceptableMatch(
  match: CoordinatedProductMatchResult,
): boolean {
  if (
    match.similarity
    < MINIMUM_ACCEPTED_SIMILARITY
  ) {
    return false;
  }

  const hasBlockingDifference =
    match.differentDimensions.some(
      (dimension) =>
        BLOCKING_DIFFERENT_DIMENSIONS.has(
          dimension,
        ),
    );

  return !hasBlockingDifference;
}

export async function matchSchoolList(
  lines: string[],
): Promise<SchoolListMatch[]> {
  return Promise.all(
    lines.map(
      async (
        line,
      ): Promise<SchoolListMatch> => {
        /*
         * Request several ranked candidates so that an unsafe
         * first result can be rejected without overlooking a
         * valid candidate immediately below it.
         */
        const matches =
          await educationalProductMatchCoordinator.findBestMatches(
            line,
            MAXIMUM_CANDIDATES_TO_REVIEW,
          );

        const bestMatch =
          matches.find(
            isAcceptableMatch,
          );

        if (!bestMatch) {
          return {
            originalLine: line,

            similarity: 0,
          };
        }

        return {
          originalLine: line,

          matchedProductId:
            bestMatch.product.id,

          matchedProductName:
            bestMatch.product.productName,

          similarity:
            bestMatch.similarity,
        };
      },
    ),
  );
}