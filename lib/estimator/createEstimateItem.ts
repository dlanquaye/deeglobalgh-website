import {
  MatchMethod,
  MatchStatus,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";
import { findBestMatches } from "@/lib/knowledge/engine/findBestMatches";
import { getProductCatalogue } from "@/lib/knowledge/repository/getProductCatalogue";

export async function createEstimateItem(
  estimateId: string,
  productName: string,
  quantity: number,
  productId?: string
) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(
      "Quantity must be a whole number greater than 0."
    );
  }

  // =========================================================
  // FAST PATH
  // Product deliberately selected from autocomplete.
  // =========================================================
  if (productId) {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error(
        "Selected product not found."
      );
    }

    const unitPrice = new Decimal(
      product.retailPrice
    );

    const totalPrice = unitPrice.mul(
      quantity
    );

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

        const item =
          await tx.estimateItem.create({
            data: {
              estimateRequestId:
                estimateId,

              lineNumber:
                existingItems + 1,

              description:
                productName,

              quantity,

              productId:
                product.id,

              matchMethod:
                MatchMethod.MANUAL,

              matchStatus:
                MatchStatus.MATCHED,

              matchConfidence:
                100,

              unitPrice,

              totalPrice,
            },
          });

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

        return item;
      }
    );
  }

  // =========================================================
  // KNOWLEDGE ENGINE PATH
  // Free-text product description.
  // =========================================================
  const catalogue =
    await getProductCatalogue();

  const matches = findBestMatches(
    productName,
    catalogue,
    5
  );

  const bestMatch = matches[0];

  const matchedProduct =
    bestMatch?.product;

  const matchConfidence =
    bestMatch?.similarity ?? null;

  const matchStatus =
    matchedProduct != null
      ? MatchStatus.MATCHED
      : MatchStatus.NOT_FOUND;

  const matchMethod =
    matchedProduct != null
      ? MatchMethod.AUTO
      : MatchMethod.NONE;

  const unitPrice =
    matchedProduct?.retailPrice != null
      ? new Decimal(
          matchedProduct.retailPrice
        )
      : null;

  const totalPrice =
    unitPrice != null
      ? unitPrice.mul(quantity)
      : null;

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

      const item =
        await tx.estimateItem.create({
          data: {
            estimateRequestId:
              estimateId,

            lineNumber:
              existingItems + 1,

            description:
              productName,

            quantity,

            productId:
              matchedProduct?.id,

            matchMethod,

            matchStatus,

            matchConfidence,

            unitPrice,

            totalPrice,
          },
        });

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

      return item;
    }
  );
}
