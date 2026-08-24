import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";

export async function deleteEstimateItem(
  estimateId: string,
  itemId: string
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

  return prisma.$transaction(
    async (tx) => {
      /*
       * ==========================================
       * VERIFY ITEM OWNERSHIP
       * ==========================================
       *
       * Never delete an EstimateItem based on itemId
       * alone. It must belong to the supplied estimate.
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
            lineNumber: true,
          },
        });

      if (!existingItem) {
        throw new Error(
          "Quotation item not found."
        );
      }

      /*
       * ==========================================
       * DELETE ITEM
       * ==========================================
       */
      await tx.estimateItem.delete({
        where: {
          id:
            itemId,
        },
      });

      /*
       * ==========================================
       * RESEQUENCE FOLLOWING ROWS
       * ==========================================
       *
       * Keep quotation numbering contiguous after
       * deletion.
       *
       * Example:
       *
       * 1
       * 2
       * 3 <- deleted
       * 4
       * 5
       *
       * becomes:
       *
       * 1
       * 2
       * 3
       * 4
       */
      const followingItems =
        await tx.estimateItem.findMany({
          where: {
            estimateRequestId:
              estimateId,

            lineNumber: {
              gt:
                existingItem.lineNumber,
            },
          },

          orderBy: {
            lineNumber:
              "asc",
          },

          select: {
            id: true,
            lineNumber: true,
          },
        });

      for (
        const item
        of followingItems
      ) {
        await tx.estimateItem.update({
          where: {
            id:
              item.id,
          },

          data: {
            lineNumber:
              item.lineNumber -
              1,
          },
        });
      }

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

      return {
        deletedItemId:
          itemId,
      };
    }
  );
}