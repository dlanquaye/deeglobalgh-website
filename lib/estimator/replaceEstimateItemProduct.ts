import {
  MatchMethod,
  MatchStatus,
} from "@prisma/client";

import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";

export async function replaceEstimateItemProduct(
  estimateId: string,
  itemId: string,
  productId: string
) {
  if (!estimateId) {
    throw new Error(
      "Estimate ID is required."
    );
  }

  if (!itemId) {
    throw new Error(
      "Quotation item ID is required."
    );
  }

  if (!productId) {
    throw new Error(
      "Replacement product is required."
    );
  }

  return prisma.$transaction(
    async (tx) => {
      /*
       * ==========================================
       * VERIFY QUOTATION ITEM
       * ==========================================
       *
       * The item must belong to this estimate.
       */
      const existingItem =
        await tx.estimateItem.findFirst({
          where: {
            id:
              itemId,

            estimateRequestId:
              estimateId,
          },

          select: {
            id: true,
            quantity: true,
          },
        });

      if (!existingItem) {
        throw new Error(
          "Quotation item not found."
        );
      }

      /*
       * ==========================================
       * VERIFY REPLACEMENT PRODUCT
       * ==========================================
       *
       * Only an active catalogue product may be
       * deliberately selected as a replacement.
       */
      const product =
        await tx.product.findFirst({
          where: {
            id:
              productId,

            isActive:
              true,
          },

          select: {
            id: true,
            name: true,
            retailPrice: true,
          },
        });

      if (!product) {
        throw new Error(
          "Selected catalogue product not found."
        );
      }

      /*
       * ==========================================
       * QUOTATION PRICE
       * ==========================================
       *
       * On replacement, initialise this quotation
       * line using the selected product's current
       * retail price.
       *
       * Staff may then independently edit the
       * quotation price afterwards.
       *
       * This NEVER changes Product.retailPrice.
       */
      const unitPrice =
        new Decimal(
          product.retailPrice
        );

      const totalPrice =
        unitPrice.mul(
          existingItem.quantity
        );

      /*
       * ==========================================
       * REPLACE PRODUCT LINK
       * ==========================================
       *
       * IMPORTANT:
       *
       * This is quotation metadata only.
       *
       * It does NOT:
       *
       * - decrement inventory
       * - increment inventory
       * - change Product.stockQty
       * - create a StockMovement
       * - reserve stock
       *
       * An estimate is not a sale.
       */
      const item =
        await tx.estimateItem.update({
          where: {
            id:
              itemId,
          },

          data: {
            productId:
              product.id,

            description:
              product.name,

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

      /*
       * ==========================================
       * RECALCULATE ESTIMATE TOTAL
       * ==========================================
       */
      const totals =
        await tx.estimateItem.aggregate({
          where: {
            estimateRequestId:
              estimateId,
          },

          _sum: {
            totalPrice:
              true,
          },
        });

      await tx.estimateRequest.update({
        where: {
          id:
            estimateId,
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