import { parseNaccaRecords } from "./parser";
import { normaliseRecord } from "./normaliser";
import {
  ImportSummary,
  NaccaBookRecord,
} from "./types";

/**
 * Main EKB Import Pipeline.
 *
 * Later versions will save directly to Prisma.
 */

export function importNaccaData(
  rawRecords: unknown[],
): {
  records: NaccaBookRecord[];
  summary: ImportSummary;
} {
  const parsed =
    parseNaccaRecords(rawRecords);

  const records = parsed.map(
    normaliseRecord,
  );

  return {
    records,

    summary: {
      publishers: 0,
      bookLines: 0,
      books: records.length,
      authors: 0,
      skipped: 0,
    },
  };
}