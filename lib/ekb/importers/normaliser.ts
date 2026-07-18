import { NaccaBookRecord } from "./types";
import { normaliseText } from "../utils/normalise";

export function normaliseRecord(
  record: NaccaBookRecord,
): NaccaBookRecord {
  return {
    ...record,

    publisher: normaliseText(record.publisher),

    title: normaliseText(record.title),

    subject: normaliseText(record.subject),

    level: normaliseText(record.level),

    resourceType: normaliseText(
      record.resourceType,
    ),

    language: record.language
      ? normaliseText(record.language)
      : undefined,

    curriculum: record.curriculum
      ? normaliseText(record.curriculum)
      : undefined,

    authors: record.authors.map(normaliseText),
  };
}