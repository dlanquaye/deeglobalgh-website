import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";
import { SchoolListMatch } from "@/lib/ocr/matchSchoolList";

interface AttachmentCompletionOptions {
  attachmentId: string;
  ocrText: string;
}

/*
 * Extract a safe requested quantity from the original
 * school-list line.
 *
 * Supported examples:
 *
 * Note One (5)
 * Nataraj Pencil 2 packs
 * Eraser 10 pieces
 * Cutter 2 pieces
 * Poster Colour 1 box
 * Crayon 2 packs (big)
 * Ruler 3 pieces
 * Blue Pen 5 pieces
 *
 * Educational level markers such as (KG1), (KG 2),
 * Basic 3, JHS 2, etc. are deliberately not treated
 * as quantities.
 */
function extractRequestedQuantity(
  line: string
): number {
  const cleanLine =
    line.trim();

  /*
   * Parenthesised bare number.
   *
   * Examples:
   * Note One (5)
   * G (5) Big Size
   * A1 (8) Big Size
   */
  const parenthesisedQuantity =
    cleanLine.match(
      /\(\s*(\d+)\s*\)/
    );

  if (
    parenthesisedQuantity
  ) {
    const quantity =
      Number(
        parenthesisedQuantity[1]
      );

    if (
      Number.isInteger(
        quantity
      ) &&
      quantity > 0
    ) {
      return quantity;
    }
  }

  /*
   * Explicit stationery quantity/unit.
   *
   * Examples:
   * 1 Ream
   * 2 packs
   * 10 pieces
   * 1 box
   */
  const unitQuantity =
    cleanLine.match(
      /\b(\d+)\s*(?:reams?|packs?|pieces?|pcs?|boxes?|box|piece|pack)\b/i
    );

  if (
    unitQuantity
  ) {
    const quantity =
      Number(
        unitQuantity[1]
      );

    if (
      Number.isInteger(
        quantity
      ) &&
      quantity > 0
    ) {
      return quantity;
    }
  }

  return 1;
}

export async function createEstimateItemsFromMatches(
  estimateId: string,
  matches: SchoolListMatch[],
  attachmentCompletion?: AttachmentCompletionOptions
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

      /*
       * When this function is being used by OCR processing,
       * verify that the attachment belongs to this estimate
       * and is currently in PROCESSING state.
       *
       * This prevents the item-creation transaction from
       * completing against the wrong attachment or against
       * an attachment that has not been successfully claimed
       * for processing.
       */
      if (attachmentCompletion) {
        const attachment =
          await tx.estimateAttachment.findFirst({
            where: {
              id:
                attachmentCompletion.attachmentId,

              estimateRequestId:
                estimateId,

              ocrStatus:
                "PROCESSING",
            },

            select: {
              id: true,
            },
          });

        if (!attachment) {
          throw new Error(
            "Attachment is not available for processing."
          );
        }
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

      for (
        const match of
        matches
      ) {
        const quantity =
          extractRequestedQuantity(
            match.originalLine
          );

        /*
         * ==========================================
         * UNMATCHED SCHOOL-LIST LINE
         * ==========================================
         *
         * Never discard an OCR line simply because
         * no safe automatic Product match was found.
         *
         * Textbooks, stationery and ambiguous lines
         * must remain visible to staff for review and
         * manual matching.
         */
        if (
          !match.matchedProductId
        ) {
          await tx.estimateItem.create({
            data: {
              estimateRequestId:
                estimateId,

              lineNumber:
                lineNumber++,

              description:
                match.originalLine,

              quantity,

              productId:
                null,

              matchMethod:
                "NONE",

              matchStatus:
                "NOT_FOUND",

              matchConfidence:
                match.similarity,

              unitPrice:
                null,

              totalPrice:
                null,
            },
          });

          continue;
        }

        /*
         * ==========================================
         * MATCHED PRODUCT
         * ==========================================
         */
        const product =
          await tx.product.findUnique({
            where: {
              id:
                match.matchedProductId,
            },
          });

        /*
         * A product could theoretically disappear
         * between matching and item creation.
         *
         * Preserve the customer's original line
         * instead of silently dropping it.
         */
        if (!product) {
          await tx.estimateItem.create({
            data: {
              estimateRequestId:
                estimateId,

              lineNumber:
                lineNumber++,

              description:
                match.originalLine,

              quantity,

              productId:
                null,

              matchMethod:
                "NONE",

              matchStatus:
                "NOT_FOUND",

              matchConfidence:
                match.similarity,

              unitPrice:
                null,

              totalPrice:
                null,
            },
          });

          continue;
        }

        matchedBooks++;

        const unitPrice =
          new Decimal(
            product.retailPrice
          );

        const totalPrice =
          unitPrice.mul(
            quantity
          );

        await tx.estimateItem.create({
          data: {
            estimateRequestId:
              estimateId,

            lineNumber:
              lineNumber++,

            description:
              match.originalLine,

            quantity,

            productId:
              product.id,

            matchMethod:
              "AUTO",

            matchStatus:
              "MATCHED",

            matchConfidence:
              match.similarity,

            unitPrice,

            totalPrice,
          },
        });
      }

      /*
       * ==========================================
       * ESTIMATE TOTAL
       * ==========================================
       *
       * Unmatched items have no price yet and are
       * naturally excluded from the Decimal aggregate
       * until staff manually match or price them.
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

      /*
       * ==========================================
       * ATTACHMENT COMPLETION
       * ==========================================
       *
       * When OCR processing supplied attachment details,
       * mark the attachment COMPLETED inside the same
       * transaction that creates the EstimateItems.
       *
       * This is important for idempotency:
       *
       * - if item creation fails, COMPLETED is not saved;
       * - if COMPLETED cannot be saved, item creation rolls
       *   back as well;
       * - we therefore never intentionally commit new OCR
       *   items while leaving the attachment retryable.
       */
      if (attachmentCompletion) {
        await tx.estimateAttachment.update({
          where: {
            id:
              attachmentCompletion.attachmentId,
          },

          data: {
            ocrText:
              attachmentCompletion.ocrText,

            booksFound:
              matches.length,

            matchedBooks,

            ocrStatus:
              "COMPLETED",
          },
        });
      }

      return {
        booksFound:
          matches.length,

        matchedBooks,
      };
    },

    /*
     * Neon may occasionally need longer than
     * Prisma's default interactive transaction
     * startup window.
     */
    {
      maxWait:
        10000,

      timeout:
        30000,
    }
  );
}