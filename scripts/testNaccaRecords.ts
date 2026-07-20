/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Structured Record Inspection Script
 * ============================================================
 *
 * Downloads or retrieves the cached official NaCCA document,
 * extracts its text, converts the textbook section into
 * structured subject-aware records and prints an inspection
 * report.
 *
 * This script performs no database writes.
 * ============================================================
 */

import path from "node:path";

import {
  NaccaDocumentParser,
} from "../lib/ekb/importers/sources/nacca/NaccaDocumentParser";

import {
  NaccaDocumentSectionParser,
} from "../lib/ekb/importers/sources/nacca/NaccaDocumentSectionParser";

import {
  NaccaSource,
} from "../lib/ekb/importers/sources/nacca/NaccaSource";

const INSPECTION_RECORD_LIMIT =
  100;

async function main(): Promise<void> {
  console.log(
    "Inspecting structured NaCCA textbook records...\n",
  );

  const cacheDirectory =
    path.resolve(
      ".cache",
      "ekb",
      "nacca",
    );

  const source =
    new NaccaSource({
      cacheDirectory,

      allowCachedDocument:
        true,
    });

  const sourceDocument =
    await source.fetchLatest();

  const documentParser =
    new NaccaDocumentParser();

  const parsedDocument =
    await documentParser.parse(
      sourceDocument.localPath,
    );

  const documentLines =
    parsedDocument.text.split(
      "\n",
    );

  const nonEmptyLines =
    documentLines.filter(
      (line) =>
        line.trim().length > 0,
    );

  const sectionParser =
    new NaccaDocumentSectionParser();

  const result =
    sectionParser.parse(
      documentLines,
    );

  console.log(
    "Source document",
  );

  console.log(
    "---------------",
  );

  console.log(
    `Authority: ${sourceDocument.authority}`,
  );

  console.log(
    `Title: ${sourceDocument.title}`,
  );

  console.log(
    `Version: ${sourceDocument.version}`,
  );

  console.log(
    `Source URL: ${sourceDocument.sourceUrl}`,
  );

  console.log(
    `Local path: ${sourceDocument.localPath}`,
  );

  console.log(
    `MIME type: ${sourceDocument.mimeType}`,
  );

  console.log();

  console.log(
    "Parsed document",
  );

  console.log(
    "---------------",
  );

  console.log(
    `Pages: ${parsedDocument.pageCount}`,
  );

  console.log(
    `Size: ${parsedDocument.size} bytes`,
  );

  console.log(
    `Physical lines: ${documentLines.length}`,
  );

  console.log(
    `Non-empty lines: ${nonEmptyLines.length}`,
  );

  console.log(
    `Parsed at: ${parsedDocument.parsedAt.toISOString()}`,
  );

  console.log();

  console.log(
    "Parser summary",
  );

  console.log(
    "--------------",
  );

  console.log(
    `Textbook section detected: ${result.detectedTextbookSection}`,
  );

  console.log(
    `Supplementary section detected: ${result.detectedSupplementarySection}`,
  );

  console.log(
    `Subject sections: ${result.sections.length}`,
  );

  console.log(
    `Parsed records: ${result.records.length}`,
  );

  console.log(
    `Parse failures: ${result.failures.length}`,
  );

  console.log(
    `Ignored numbered rows: ${result.ignoredNumberedRows.length}`,
  );

  console.log();

  console.log(
    "Subject breakdown",
  );

  console.log(
    "-----------------",
  );

  for (
    const section
    of result.sections
  ) {
    console.log(
      [
        section.subject.code,
        section.subject.name,
        `records=${section.records.length}`,
        `failures=${section.failures.length}`,
        `heading=${section.subject.sourceHeading}`,
      ].join(" | "),
    );
  }

  console.log();

  const displayedRecordCount =
    Math.min(
      INSPECTION_RECORD_LIMIT,
      result.records.length,
    );

  console.log(
    `First ${displayedRecordCount} structured records`,
  );

  console.log(
    "----------------------------",
  );

  for (
    const [
      index,
      record,
    ] of result.records
      .slice(
        0,
        INSPECTION_RECORD_LIMIT,
      )
      .entries()
  ) {
    const displayIndex =
      String(index + 1).padStart(
        4,
        "0",
      );

    console.log(
      [
        `${displayIndex}:`,
        `[${record.subjectCode}]`,
        record.title,
        "|",
        record.level,
        "|",
        record.publisher,
      ].join(" "),
    );
  }

  if (
    result.failures.length > 0
  ) {
    console.log();

    console.log(
      "Parse failures",
    );

    console.log(
      "--------------",
    );

    for (
      const [
        index,
        failure,
      ] of result.failures.entries()
    ) {
      const displayIndex =
        String(index + 1).padStart(
          4,
          "0",
        );

      console.log(
        [
          `${displayIndex}:`,
          failure.reason,
          "|",
          failure.row.rawText,
        ].join(" "),
      );

      console.log(
        `      ${failure.message}`,
      );
    }
  }

  if (
    result.ignoredNumberedRows.length >
    0
  ) {
    console.log();

    console.log(
      "Ignored numbered rows",
    );

    console.log(
      "---------------------",
    );

    for (
      const [
        index,
        row,
      ] of result
        .ignoredNumberedRows
        .entries()
    ) {
      const displayIndex =
        String(index + 1).padStart(
          4,
          "0",
        );

      console.log(
        `${displayIndex}: ${row.rawText}`,
      );
    }
  }

  console.log();

  console.log(
    "Structured NaCCA record inspection completed successfully.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(
      "\nStructured NaCCA record inspection failed.",
    );

    if (
      error instanceof Error
    ) {
      console.error(
        error.stack ??
          error.message,
      );
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  },
);