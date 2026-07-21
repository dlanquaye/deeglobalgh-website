/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Import Record Parser
 * ============================================================
 *
 * Converts structured NaCCA textbook records into the standard
 * EKB importer contract.
 *
 * The source parser already supplies:
 *
 * - title;
 * - publisher;
 * - educational level;
 * - subject context.
 *
 * Fields that are not explicitly represented in the official
 * NaCCA table are assigned conservative import defaults:
 *
 * - resourceType: Textbook
 * - language: English
 * - curriculum: NaCCA
 * - authors: []
 *
 * This component does not:
 *
 * - write to the database;
 * - resolve entities against the EKB;
 * - create publishers, books or editions;
 * - infer authors from publisher text;
 * - build synchronisation plans.
 * ============================================================
 */

import { NaccaBookRecord } from "./types";
import { NaccaResourceTypeClassifier } from "./classifiers/NaccaResourceTypeClassifier";

const resourceTypeClassifier =
  new NaccaResourceTypeClassifier();

interface StructuredNaccaRecord {
  title: unknown;

  publisher: unknown;

  level: unknown;

  subjectName?: unknown;

  subject?: unknown;

  bookLine?: unknown;

  resourceType?: unknown;

  language?: unknown;

  curriculum?: unknown;

  isbn?: unknown;

  authors?: unknown;
}

const DEFAULT_RESOURCE_TYPE =
  "Textbook";

const DEFAULT_LANGUAGE =
  "English";

const DEFAULT_CURRICULUM =
  "NaCCA";

export function parseNaccaRecords(
  records: readonly unknown[],
): NaccaBookRecord[] {
  const parsedRecords:
    NaccaBookRecord[] = [];

  for (const record of records) {
    const parsed =
      parseNaccaRecord(record);

    if (parsed) {
      parsedRecords.push(parsed);
    }
  }

  return parsedRecords;
}

function parseNaccaRecord(
  value: unknown,
): NaccaBookRecord | null {
  if (!isStructuredRecord(value)) {
    return null;
  }

  const title =
    readRequiredString(
      value.title,
    );

  const publisher =
    readRequiredString(
      value.publisher,
    );

  const level =
    readRequiredString(
      value.level,
    );

  const subject =
    readRequiredString(
      value.subjectName,
    ) ??
    readRequiredString(
      value.subject,
    );

  if (
    !title ||
    !publisher ||
    !level ||
    !subject
  ) {
    return null;
  }

  const bookLine =
    readOptionalString(
      value.bookLine,
    );

const suppliedResourceType =
  readOptionalString(
    value.resourceType,
  );

const classifiedResourceType =
  resourceTypeClassifier.classify(
    title,
  );

const resourceType =
  classifiedResourceType !==
  DEFAULT_RESOURCE_TYPE
    ? classifiedResourceType
    : suppliedResourceType ??
      DEFAULT_RESOURCE_TYPE;

  const language =
    readOptionalString(
      value.language,
    ) ??
    DEFAULT_LANGUAGE;

  const curriculum =
    readOptionalString(
      value.curriculum,
    ) ??
    DEFAULT_CURRICULUM;

  const isbn =
    readOptionalString(
      value.isbn,
    );

  const authors =
    readAuthors(
      value.authors,
    );

    

  return {
    publisher,

    ...(bookLine
      ? {
          bookLine,
        }
      : {}),

    title,

    subject,

    level,

    resourceType,

    language,

    curriculum,

    ...(isbn
      ? {
          isbn,
        }
      : {}),

    authors,
  };
}

function isStructuredRecord(
  value: unknown,
): value is StructuredNaccaRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    "publisher" in value &&
    "level" in value
  );
}

function readRequiredString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalised =
    normaliseSpacing(value);

  return normalised || null;
}

function readOptionalString(
  value: unknown,
): string | undefined {
  const parsed =
    readRequiredString(value);

  return parsed ?? undefined;
}

function readAuthors(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        author,
      ): author is string =>
        typeof author === "string",
    )
    .map(normaliseSpacing)
    .filter(Boolean);
}

function normaliseSpacing(
  value: string,
): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/\ufeff/g, "")
    .replace(/\s+/g, " ")
    .trim();
}