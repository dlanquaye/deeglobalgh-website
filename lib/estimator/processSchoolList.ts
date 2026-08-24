import { prisma } from "@/lib/prisma";

import { extractText } from "@/lib/ocr/extractText";

import {
  splitSchoolListWithSections,
} from "@/lib/ocr/splitSchoolList";

import { cleanSchoolList } from "@/lib/ocr/cleanSchoolList";
import { matchSchoolList } from "@/lib/ocr/matchSchoolList";

import {
  SchoolListMatch,
} from "@/lib/ocr/matchSchoolList";

import { createEstimateItemsFromMatches } from "./createEstimateItemsFromMatches";

function detectDocumentLevelContext(
  text: string
): string | undefined {
  const normalized =
    text.replace(/\r/g, "");

  const firstLines =
    normalized
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 8)
      .join(" ");

  const kgMatch =
    firstLines.match(
      /\bKG\s*\(?\s*([12])\s*\)?\b/i
    );

  if (kgMatch) {
    return `KG${kgMatch[1]}`;
  }

  const kindergartenMatch =
    firstLines.match(
      /\bKindergarten\s*([12])\b/i
    );

  if (kindergartenMatch) {
    return `KG${kindergartenMatch[1]}`;
  }

  const basicMatch =
    firstLines.match(
      /\bBasic\s*([1-9])\b/i
    );

  if (basicMatch) {
    return `Basic ${basicMatch[1]}`;
  }

  const jhsMatch =
    firstLines.match(
      /\bJHS\s*([1-3])\b/i
    );

  if (jhsMatch) {
    return `JHS ${jhsMatch[1]}`;
  }

  const shsMatch =
    firstLines.match(
      /\bSHS\s*([1-3])\b/i
    );

  if (shsMatch) {
    return `SHS ${shsMatch[1]}`;
  }

  return undefined;
}

export async function processSchoolList(
  attachmentId: string
) {
  const attachment =
    await prisma.estimateAttachment.findUnique({
      where: {
        id: attachmentId,
      },
    });

  if (!attachment) {
    throw new Error(
      "Attachment not found."
    );
  }

  /*
   * ==========================================
   * IDEMPOTENT PROCESSING CLAIM
   * ==========================================
   *
   * An attachment may be processed only when it is
   * PENDING or FAILED.
   *
   * updateMany() makes the transition to PROCESSING
   * conditional and atomic. If two requests arrive
   * at nearly the same time, only one can successfully
   * claim the attachment.
   *
   * COMPLETED attachments can therefore never append
   * a second copy of their EstimateItems.
   */
  const claim =
    await prisma.estimateAttachment.updateMany({
      where: {
        id:
          attachment.id,

        ocrStatus: {
          in: [
            "PENDING",
            "FAILED",
          ],
        },
      },

      data: {
        ocrStatus:
          "PROCESSING",
      },
    });

  if (
    claim.count !== 1
  ) {
    const currentAttachment =
      await prisma.estimateAttachment.findUnique({
        where: {
          id:
            attachment.id,
        },

        select: {
          ocrStatus:
            true,
        },
      });

    if (
      currentAttachment?.ocrStatus ===
      "COMPLETED"
    ) {
      throw new Error(
        "This school list has already been processed."
      );
    }

    if (
      currentAttachment?.ocrStatus ===
      "PROCESSING"
    ) {
      throw new Error(
        "This school list is already being processed."
      );
    }

    throw new Error(
      "This school list is not available for processing."
    );
  }

  try {
    /*
     * ==========================================
     * OCR
     * ==========================================
     */
    const text =
      await extractText(
        attachment.filePath
      );

    const documentLevelContext =
      detectDocumentLevelContext(
        text
      );

    /*
     * ==========================================
     * SPLIT WHILE PRESERVING SECTION IDENTITY
     * ==========================================
     */
    const structuredItems =
      splitSchoolListWithSections(
        text
      );

    /*
     * ==========================================
     * CLEAN EACH LINE WHILE PRESERVING SECTION
     * ==========================================
     */
    const cleanedItems =
      structuredItems
        .map((item) => {
          const cleaned =
            cleanSchoolList([
              item.text,
            ]);

          return {
            section:
              item.section,

            text:
              cleaned[0] ?? "",
          };
        })
        .filter(
          (item) =>
            item.text.length > 0
        );

    /*
     * ==========================================
     * MATCH TEXTBOOK ROWS ONLY
     * ==========================================
     */
    const textbookItems =
      cleanedItems.filter(
        (item) =>
          item.section ===
          "TEXTBOOKS"
      );

    const textbookMatches =
      await matchSchoolList(
        textbookItems.map(
          (item) =>
            item.text
        ),
        documentLevelContext
      );

    /*
     * Reconstruct the original document order.
     *
     * TEXTBOOKS:
     * use the educational matcher.
     *
     * STATIONERY:
     * deliberately remain unmatched/manual for now.
     *
     * This prevents stationery such as pencils,
     * exercise books, rulers and crayons from being
     * incorrectly substituted with educational books
     * purely because they share KG document context.
     */
    const matches:
      SchoolListMatch[] = [];

    let textbookMatchIndex =
      0;

    for (
      const item
      of cleanedItems
    ) {
      if (
        item.section ===
        "TEXTBOOKS"
      ) {
        const match =
          textbookMatches[
            textbookMatchIndex
          ];

        textbookMatchIndex += 1;

        if (match) {
          matches.push(
            match
          );
        } else {
          matches.push({
            originalLine:
              item.text,

            similarity:
              0,
          });
        }

        continue;
      }

      matches.push({
        originalLine:
          item.text,

        similarity:
          0,
      });
    }

    /*
     * ==========================================
     * CREATE ITEMS + COMPLETE ATTACHMENT
     * ==========================================
     *
     * EstimateItem creation and attachment COMPLETED
     * status are committed by the same transaction.
     *
     * If either part fails, both are rolled back.
     */
    const stats =
      await createEstimateItemsFromMatches(
        attachment.estimateRequestId,
        matches,
        {
          attachmentId:
            attachment.id,

          ocrText:
            text,
        }
      );

    return stats;
  } catch (error) {
    /*
     * If OCR, matching or item creation fails after
     * this request successfully claimed the attachment,
     * return it to a retryable FAILED state.
     *
     * Only change PROCESSING -> FAILED so that we never
     * accidentally overwrite a later successful state.
     */
    await prisma.estimateAttachment.updateMany({
      where: {
        id:
          attachment.id,

        ocrStatus:
          "PROCESSING",
      },

      data: {
        ocrStatus:
          "FAILED",
      },
    });

    throw error;
  }
}