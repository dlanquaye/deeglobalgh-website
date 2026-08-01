import {
  EducationalProductMatchCoordinator,
} from "@/lib/estimator/EducationalProductMatchCoordinator";

export interface SchoolListMatch {
  originalLine: string;

  matchedProductId?: string;

  matchedProductName?: string;

  similarity: number;
}

const educationalProductMatchCoordinator =
  new EducationalProductMatchCoordinator();

export async function matchSchoolList(
  lines: string[],
): Promise<SchoolListMatch[]> {
  return Promise.all(
    lines.map(
      async (
        line,
      ): Promise<SchoolListMatch> => {
        const matches =
          await educationalProductMatchCoordinator.findBestMatches(
            line,
            1,
          );

        if (
          matches.length === 0
        ) {
          return {
            originalLine: line,

            similarity: 0,
          };
        }

        const bestMatch =
          matches[0];

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