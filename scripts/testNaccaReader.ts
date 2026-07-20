/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Import Reader Inspection
 * ============================================================
 *
 * Verifies that the complete official-source pipeline produces
 * records matching the generic EKB importer contract.
 *
 * Pipeline under test:
 *
 * NaccaSource
 * → document download/cache
 * → PDF parsing
 * → textbook-section parsing
 * → standard NaccaBookRecord conversion
 * ============================================================
 */

import path from "node:path";

import {
  NaccaReader,
} from "../lib/ekb/importers/readers/naccaReader";

async function main(): Promise<void> {
  console.log(
    "Inspecting NaCCA importer records...\n",
  );

  const cacheDirectory =
    path.resolve(
      process.cwd(),
      ".cache",
      "ekb",
      "nacca",
    );

  const reader =
    new NaccaReader({
      cacheDirectory,

      allowCachedDocument:
        true,
    });

  const records =
    await reader.read();

  console.log(
    "Importer summary",
  );

  console.log(
    "----------------",
  );

  console.log(
    `Records: ${records.length}`,
  );

  const missingPublisher =
    records.filter(
      (record) =>
        !record.publisher,
    ).length;

  const missingTitle =
    records.filter(
      (record) =>
        !record.title,
    ).length;

  const missingSubject =
    records.filter(
      (record) =>
        !record.subject,
    ).length;

  const missingLevel =
    records.filter(
      (record) =>
        !record.level,
    ).length;

  const missingResourceType =
    records.filter(
      (record) =>
        !record.resourceType,
    ).length;

  console.log(
    `Missing publisher: ${missingPublisher}`,
  );

  console.log(
    `Missing title: ${missingTitle}`,
  );

  console.log(
    `Missing subject: ${missingSubject}`,
  );

  console.log(
    `Missing level: ${missingLevel}`,
  );

  console.log(
    `Missing resource type: ${missingResourceType}`,
  );

  console.log(
    "\nFirst 25 importer records",
  );

  console.log(
    "-------------------------",
  );

  for (
    const [
      index,
      record,
    ] of records
      .slice(0, 25)
      .entries()
  ) {
    console.log(
      [
        String(index + 1)
          .padStart(4, "0"),
        record.subject,
        record.title,
        record.level,
        record.publisher,
        record.resourceType,
        record.language ??
          "NO_LANGUAGE",
        record.curriculum ??
          "NO_CURRICULUM",
      ].join(" | "),
    );
  }

  const subjects =
    new Map<string, number>();

  for (const record of records) {
    subjects.set(
      record.subject,
      (
        subjects.get(
          record.subject,
        ) ?? 0
      ) + 1,
    );
  }

  console.log(
    "\nSubject breakdown",
  );

  console.log(
    "-----------------",
  );

  for (
    const [
      subject,
      count,
    ] of [...subjects.entries()]
      .sort(
        (
          left,
          right,
        ) =>
          left[0].localeCompare(
            right[0],
          ),
      )
  ) {
    console.log(
      `${subject}: ${count}`,
    );
  }

  if (records.length === 0) {
    throw new Error(
      "The NaCCA reader returned no importer records.",
    );
  }

  if (
    missingPublisher > 0 ||
    missingTitle > 0 ||
    missingSubject > 0 ||
    missingLevel > 0 ||
    missingResourceType > 0
  ) {
    throw new Error(
      "One or more NaCCA importer records are missing required fields.",
    );
  }

  console.log(
    "\nNaCCA importer record inspection completed successfully.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(
      "\nNaCCA importer record inspection failed.",
    );

    console.error(error);

    process.exitCode = 1;
  },
);