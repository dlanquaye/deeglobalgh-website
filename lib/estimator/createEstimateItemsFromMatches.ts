import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";
import { SchoolListMatch } from "@/lib/ocr/matchSchoolList";

export async function createEstimateItemsFromMatches(
  estimateId: string,
  matches: SchoolListMatch[]
) {
  return prisma.$transaction(
    async (tx) => {
      const estimate =
        await tx.estimateRequest.findUnique({
          where: {
            id: estimateId,
          },
          select: {
            id: true,
          },
        });

      if (!estimate) {
        throw new Error(
          "Estimate request not found."
        );
      }

      const existingItems =
        await tx.estimateItem.count({
          where: {
            estimateRequestId:
              estimateId,
          },
        });

      let lineNumber =
        existingItems + 1;

      let matchedBooks = 0;

      for (const match of matches) {
        if (!match.matchedProductId) {
          continue;
        }

        const product =
          await tx.product.findUnique({
            where: {
              id: match.matchedProductId,
            },
          });

        if (!product) {
          continue;
        }

        matchedBooks++;

        const unitPrice =
          new Decimal(
            product.retailPrice
          );

        await tx.estimateItem.create({
          data: {
            estimateRequestId:
              estimateId,

            lineNumber:
              lineNumber++,

            description:
              match.originalLine,

            quantity: 1,

            productId:
              product.id,

            matchMethod:
              "AUTO",

            matchStatus:
              "MATCHED",

            matchConfidence:
              match.similarity,

            unitPrice,

            totalPrice:
              unitPrice,
          },
        });
      }

      const totals =
        await tx.estimateItem.aggregate({
          where: {
            estimateRequestId:
              estimateId,
          },
          _sum: {
            totalPrice: true,
          },
        });

      await tx.estimateRequest.update({
        where: {
          id: estimateId,
        },
        data: {
          estimatedTotal:
            totals._sum.totalPrice ??
            new Decimal(0),
        },
      });

      return {
        booksFound:
          matches.length,

        matchedBooks,
      };
    }
  );
}
