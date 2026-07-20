/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * NaCCA Source Inspection Script
 * ============================================================
 *
 * Downloads or reuses the cached official NaCCA publication,
 * extracts its text and prints a controlled preview.
 *
 * This script does not write anything to Prisma or Neon.
 */

import path from "node:path";

import {
  NaccaSource,
} from "../lib/ekb/importers/sources/nacca/NaccaSource";

import {
  NaccaDocumentParser,
} from "../lib/ekb/importers/sources/nacca/NaccaDocumentParser";

const CACHE_DIRECTORY =
  path.join(
    process.cwd(),
    ".cache",
    "ekb",
    "nacca",
  );

const PREVIEW_LINE_LIMIT = 250;

async function main(): Promise<void> {
  console.log(
    "Inspecting the official NaCCA source document...",
  );

  const source =
    new NaccaSource({
      cacheDirectory:
        CACHE_DIRECTORY,

      allowCachedDocument:
        true,

      publicationUrlOverride:
        process.env
          .NACCA_PUBLICATION_URL,

      documentUrlOverride:
        process.env
          .NACCA_DOCUMENT_URL,

      versionOverride:
        process.env
          .NACCA_DOCUMENT_VERSION,
    });

  const sourceDocument =
    await source.fetchLatest();

  console.log("");
  console.log("Source document");
  console.log("----------------");

  console.log(
    `Authority: ${sourceDocument.authority}`,
  );

  console.log(
    `Title: ${sourceDocument.title}`,
  );

  console.log(
    `Version: ${sourceDocument.version ?? "Unknown"}`,
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

  const parser =
    new NaccaDocumentParser();

  const parsedDocument =
    await parser.parse(
      sourceDocument.localPath,
    );

  const lines =
    parsedDocument.text
      .split("\n")
      .map((line) =>
        line.trim(),
      )
      .filter(Boolean);

  console.log("");
  console.log("Parsed document");
  console.log("----------------");

  console.log(
    `Pages: ${parsedDocument.pageCount}`,
  );

  console.log(
    `Size: ${parsedDocument.size} bytes`,
  );

  console.log(
    `Non-empty lines: ${lines.length}`,
  );

  console.log(
    `Parsed at: ${parsedDocument.parsedAt.toISOString()}`,
  );

  console.log("");
  console.log(
    `First ${Math.min(
      PREVIEW_LINE_LIMIT,
      lines.length,
    )} non-empty lines`,
  );

  console.log("----------------");

  lines
    .slice(
      0,
      PREVIEW_LINE_LIMIT,
    )
    .forEach(
      (line, index) => {
        const lineNumber =
          String(index + 1)
            .padStart(4, "0");

        console.log(
          `${lineNumber}: ${line}`,
        );
      },
    );

  console.log("");
  console.log(
    "NaCCA source inspection completed successfully.",
  );
}

main().catch(
  (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error("");
    console.error(
      "NaCCA source inspection failed.",
    );

    console.error(message);

    process.exitCode = 1;
  },
);