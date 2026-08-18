import {
  MatchMethod,
  MatchStatus,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";
import { findBestMatches } from "@/lib/knowledge/engine/findBestMatches";
import { getProductCatalogue } from "@/lib/knowledge/repository/getProductCatalogue";

interface CreateEstimateItemOptions {
  /**
   * Price used only for this quotation line.
   *
   * This NEVER updates Product.retailPrice.
   */
  unitPrice?: number;

  /**
   * When true, keep the line as a manual quotation item.
   *
   * No catalogue match is attempted and no Product record
   * is required.
   */
  manualItem?: boolean;
}

export async function createEstimateItem(
  estimateId: string,
  productName: string,
  quantity: number,
  productId?: string,
  options: CreateEstimateItemOptions = {}
) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(
      "Quantity must be a whole number greater than 0."
    );
  }

  const cleanProductName =
    productName.trim();

  if (!cleanProductName) {
    throw new Error(
      "Item description is required."
    );
  }

  if (
    options.unitPrice !== undefined &&
    (
      !Number.isFinite(
        options.unitPrice
      ) ||
      options.unitPrice < 0
    )
  ) {
    throw new Error(
      "Unit price must be 0 or greater."
    );
  }

  const quotationPrice =
    options.unitPrice !== undefined
      ? new Decimal(
          options.unitPrice
        )
      : null;

  // =========================================================
  // FAST PATH
  // Product deliberately selected from autocomplete.
  //
  // The catalogue retail price is only the DEFAULT.
  // An explicit quotation price can override it without
  // changing the Product record.
  // =========================================================
  if (productId) {
    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      throw new Error(
        "Selected product not found."
      );
    }

    const unitPrice =
      quotationPrice ??
      new Decimal(
        product.retailPrice
      );

    const totalPrice =
      unitPrice.mul(
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
                cleanProductName,

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
  // EXPLICIT MANUAL QUOTATION ITEM
  //
  // Used for products/services that DeeglobalGH can quote
  // even though they are not currently in the catalogue.
  //
  // No Product or inventory record is required.
  // =========================================================
  if (options.manualItem) {
    const unitPrice =
      quotationPrice ??
      new Decimal(0);

    const totalPrice =
      unitPrice.mul(
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
                cleanProductName,

              quantity,

              productId:
                null,

              matchMethod:
                MatchMethod.MANUAL,

              matchStatus:
                MatchStatus.NOT_FOUND,

              matchConfidence:
                null,

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
  //
  // Existing estimator behaviour is deliberately preserved
  // for free-text school-list / book matching.
  // =========================================================
  const catalogue =
    await getProductCatalogue();

  const matches =
    findBestMatches(
      cleanProductName,
      catalogue,
      5
    );

  const bestMatch =
    matches[0];

  const matchedProduct =
    bestMatch?.product;

  const matchConfidence =
    bestMatch?.similarity ??
    null;

  const matchStatus =
    matchedProduct != null
      ? MatchStatus.MATCHED
      : MatchStatus.NOT_FOUND;

  const matchMethod =
    matchedProduct != null
      ? MatchMethod.AUTO
      : MatchMethod.NONE;

  const unitPrice =
    quotationPrice ??
    (
      matchedProduct?.retailPrice != null
        ? new Decimal(
            matchedProduct.retailPrice
          )
        : null
    );

  const totalPrice =
    unitPrice != null
      ? unitPrice.mul(
          quantity
        )
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
              cleanProductName,

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
