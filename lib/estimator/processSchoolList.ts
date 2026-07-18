import { prisma } from "@/lib/prisma";

import { extractText } from "@/lib/ocr/extractText";
import { splitSchoolList } from "@/lib/ocr/splitSchoolList";
import { cleanSchoolList } from "@/lib/ocr/cleanSchoolList";
import { matchSchoolList } from "@/lib/ocr/matchSchoolList";

import { createEstimateItemsFromMatches } from "./createEstimateItemsFromMatches";

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
    throw new Error("Attachment not found.");
  }

  await prisma.estimateAttachment.update({
    where: {
      id: attachment.id,
    },
    data: {
      ocrStatus: "PROCESSING",
    },
  });

  // OCR

  const text =
    await extractText(
      attachment.filePath
    );

  // Split

  const lines =
    splitSchoolList(text);

  // Clean

  const cleanedLines =
    cleanSchoolList(lines);

  // Match

  const matches =
    await matchSchoolList(
      cleanedLines
    );

  // Create Estimate Items

  const stats =
    await createEstimateItemsFromMatches(
      attachment.estimateRequestId,
      matches
    );

  // Save OCR Results

  await prisma.estimateAttachment.update({
    where: {
      id: attachment.id,
    },
    data: {
      ocrText: text,

      booksFound: stats.booksFound,

      matchedBooks: stats.matchedBooks,

      ocrStatus: "COMPLETED",
    },
  });

  return stats;
}