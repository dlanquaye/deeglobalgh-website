/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Resource-Type Text Inspector
 * ============================================================
 *
 * Read-only diagnostic utility.
 *
 * Loads the cached official NaCCA PDF, extracts its text and
 * prints every line containing possible publication-form terms:
 *
 * - textbook;
 * - learner book;
 * - pupil book;
 * - student book;
 * - workbook;
 * - activity book;
 * - teacher guide;
 * - teacher manual.
 *
 * It also prints surrounding lines so we can see whether each
 * term is:
 *
 * - a section heading;
 * - a table heading;
 * - part of a book title;
 * - embedded in another field;
 * - absent from the document.
 *
 * This script does not:
 *
 * - write to the database;
 * - run synchronisation;
 * - create or update EKB entities;
 * - modify the cached PDF.
 * ============================================================
 */

import path from "node:path";

import {
  NaccaSource,
} from "../lib/ekb/importers/sources/nacca/NaccaSource";

import {
  NaccaDocumentParser,
} from "../lib/ekb/importers/sources/nacca/NaccaDocumentParser";

const CONTEXT_LINE_COUNT =
  4;

const RESOURCE_TYPE_PATTERN =
  /\b(?:text\s*books?|learner(?:'s|s)?\s+books?|pupil(?:'s|s)?\s+books?|student(?:'s|s)?\s+books?|work\s*books?|activity\s+books?|teacher(?:'s|s)?\s+guides?|teacher(?:'s|s)?\s+manuals?)\b/i;

const TEXTBOOK_SECTION_START_PATTERN =
  /^3\.0\s+LIST\s+OF\s+APPROVED\s+TEXTBOOKS\s+FROM\s+KINDERGARTEN\s+TO\s+JHS\b/i;

const SECTION_FOUR_PATTERN =
  /^4(?:\.0\b|\.[1-9]\b)/i;

interface MatchedLine {
  lineNumber:
    number;

  line:
    string;

  insideTextbookSection:
    boolean;
}

function normaliseLine(
  value:
    string,
): string {
  return value
    .replace(
      /\u00a0/g,
      " ",
    )
    .replace(
      /\u200b/g,
      "",
    )
    .replace(
      /\ufeff/g,
      "",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function printDivider():
void {
  console.log(
    "\n============================================================",
  );
}

function printContext(
  lines:
    readonly string[],

  matchedLine:
    MatchedLine,
): void {
  const matchedIndex =
    matchedLine.lineNumber -
    1;

  const startIndex =
    Math.max(
      matchedIndex -
        CONTEXT_LINE_COUNT,
      0,
    );

  const endIndex =
    Math.min(
      matchedIndex +
        CONTEXT_LINE_COUNT,
      lines.length -
        1,
    );

  printDivider();

  console.log(
    `MATCH AT LINE ${matchedLine.lineNumber}`,
  );

  console.log(
    `Inside Section 3 textbook table: ${matchedLine.insideTextbookSection ? "YES" : "NO"}`,
  );

  console.log(
    "------------------------------------------------------------",
  );

  for (
    let index =
      startIndex;
    index <=
    endIndex;
    index +=
      1
  ) {
    const line =
      normaliseLine(
        lines[index] ??
          "",
      );

    const marker =
      index ===
      matchedIndex
        ? ">>>"
        : "   ";

    console.log(
      `${marker} ${String(index + 1).padStart(5, " ")} | ${line}`,
    );
  }
}

async function main():
Promise<void> {
  const source =
    new NaccaSource({
      cacheDirectory:
        path.resolve(
          process.cwd(),
          ".cache",
          "ekb",
          "nacca",
        ),

      allowCachedDocument:
        true,
    });

  const documentParser =
    new NaccaDocumentParser();

  console.log(
    "\nLoading cached NaCCA document...",
  );

  const sourceDocument =
    await source.fetchLatest();

  console.log(
    `Document: ${sourceDocument.localPath}`,
  );

  const parsedDocument =
    await documentParser.parse(
      sourceDocument.localPath,
    );

  const lines =
    parsedDocument.text.split(
      /\r?\n/,
    );

  console.log(
    `Extracted lines: ${lines.length}`,
  );

  const matches:
    MatchedLine[] = [];

  let insideTextbookSection =
    false;

  for (
    let index =
      0;
    index <
    lines.length;
    index +=
      1
  ) {
    const line =
      normaliseLine(
        lines[index] ??
          "",
      );

    if (!line) {
      continue;
    }

    if (
      !insideTextbookSection &&
      TEXTBOOK_SECTION_START_PATTERN.test(
        line,
      )
    ) {
      insideTextbookSection =
        true;
    } else if (
      insideTextbookSection &&
      SECTION_FOUR_PATTERN.test(
        line,
      )
    ) {
      insideTextbookSection =
        false;
    }

    if (
      !RESOURCE_TYPE_PATTERN.test(
        line,
      )
    ) {
      continue;
    }

    matches.push({
      lineNumber:
        index +
        1,

      line,

      insideTextbookSection,
    });
  }

  printDivider();

  console.log(
    "RESOURCE-TYPE TEXT INSPECTION SUMMARY",
  );

  console.log(
    "------------------------------------------------------------",
  );

  console.log(
    `Total matching lines: ${matches.length}`,
  );

  console.log(
    `Matches inside Section 3: ${
      matches.filter(
        (
          match,
        ) =>
          match.insideTextbookSection,
      ).length
    }`,
  );

  console.log(
    `Matches outside Section 3: ${
      matches.filter(
        (
          match,
        ) =>
          !match.insideTextbookSection,
      ).length
    }`,
  );

  if (
    matches.length ===
    0
  ) {
    console.log(
      "\nNo publication-form terms were found in the extracted PDF text.",
    );

    console.log(
      "This would confirm that resource type must be derived from book titles or another source rather than document headings.",
    );

    return;
  }

  for (
    const match
    of matches
  ) {
    printContext(
      lines,
      match,
    );
  }

  printDivider();

  console.log(
    "INSPECTION COMPLETE",
  );

  console.log(
    "This script performed no database writes.",
  );
}

main().catch(
  (
    error:
      unknown,
  ) => {
    console.error(
      "\nNaCCA resource-type text inspection failed.",
    );

    console.error(
      error,
    );

    process.exitCode =
      1;
  },
);