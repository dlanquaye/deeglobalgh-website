import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { SchoolListMatch } from "@/lib/ocr/matchSchoolList";

export async function createEstimateItemsFromMatches(
  estimateId: string,
  matches: SchoolListMatch[]
) {
  let lineNumber = 1;

  let matchedBooks = 0;

  for (const match of matches) {

    if (!match.matchedProductId) {
      continue;
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: match.matchedProductId,
        },
      });

    if (!product) {
      continue;
    }

    matchedBooks++;

    await prisma.estimateItem.create({
      data: {
        estimateRequestId: estimateId,

        lineNumber: lineNumber++,

        description: match.originalLine,

        quantity: 1,

        productId: product.id,

        matchMethod: "AUTO",

        matchStatus: "MATCHED",

        matchConfidence: match.similarity,

        unitPrice: new Decimal(
          product.retailPrice
        ),

        totalPrice: new Decimal(
          product.retailPrice
        ),
      },
    });

  }

  return {
    booksFound: matches.length,
    matchedBooks,
  };
}