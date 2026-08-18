import {
  MatchMethod,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";

interface UpdateEstimateItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export async function updateEstimateItem(
  estimateId: string,
  itemId: string,
  input: UpdateEstimateItemInput
) {
  const description =
    input.description.trim();

  if (!description) {
    throw new Error(
      "Item description is required."
    );
  }

  if (
    !Number.isInteger(
      input.quantity
    ) ||
    input.quantity <= 0
  ) {
    throw new Error(
      "Quantity must be a whole number greater than 0."
    );
  }

  if (
    !Number.isFinite(
      input.unitPrice
    ) ||
    input.unitPrice < 0
  ) {
    throw new Error(
      "Unit price must be 0 or greater."
    );
  }

  const unitPrice =
    new Decimal(
      input.unitPrice
    );

  const totalPrice =
    unitPrice.mul(
      input.quantity
    );

  return prisma.$transaction(
    async (tx) => {
      // ==========================================
      // VERIFY ITEM BELONGS TO THIS ESTIMATE
      // ==========================================
      const existingItem =
        await tx.estimateItem.findFirst({
          where: {
            id: itemId,
            estimateRequestId:
              estimateId,
          },

          select: {
            id: true,
            productId: true,
          },
        });

      if (!existingItem) {
        throw new Error(
          "Quotation item not found."
        );
      }

      // ==========================================
      // UPDATE QUOTATION LINE ONLY
      // ==========================================
      //
      // This does NOT modify:
      // - Product.retailPrice
      // - Product.stockQty
      // - Inventory
      //
      // It only changes this customer's quotation.
      // ==========================================
      const item =
        await tx.estimateItem.update({
          where: {
            id: itemId,
          },

          data: {
            description,
            quantity:
              input.quantity,
            unitPrice,
            totalPrice,

            /*
             * Once an administrator manually edits
             * the commercial quotation line, record
             * that it has been manually reviewed.
             *
             * We deliberately preserve productId
             * when one already exists.
             */
            matchMethod:
              MatchMethod.MANUAL,
          },
        });

      // ==========================================
      // RECALCULATE WHOLE QUOTATION TOTAL
      // ==========================================
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
