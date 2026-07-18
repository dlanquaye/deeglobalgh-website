import { getProductCatalogue } from "@/lib/knowledge/repository/getProductCatalogue";
import { findBestMatches } from "@/lib/knowledge/engine/findBestMatches";

export interface SchoolListMatch {
  originalLine: string;

  matchedProductId?: string;

  matchedProductName?: string;

  similarity: number;
}

export async function matchSchoolList(
  lines: string[]
): Promise<SchoolListMatch[]> {

  const catalogue =
    await getProductCatalogue();

  return lines.map((line) => {

    const matches =
      findBestMatches(
        line,
        catalogue,
        1
      );

    if (matches.length === 0) {
      return {
        originalLine: line,
        similarity: 0,
      };
    }

    return {
      originalLine: line,

      matchedProductId:
        matches[0].product.id,

      matchedProductName:
        matches[0].product.productName,

      similarity:
        matches[0].similarity,
    };

  });

}