import {
  BookSegmentationResult,
  DetectedBook,
} from "@/lib/estimator/types/detectedBook";

const PUBLISHER_HINTS = [
  "orion",
  "golden",
  "derby",
  "ebs",
  "strongman",
  "bio",
  "victory",
  "calculus",
  "eps",
  "excellent",
  "wise",
  "best brain",
  "don",
];

function looksLikeNewBook(line: string): boolean {
  const lower = line.toLowerCase();

  if (/^\d+[.)]?\s*/.test(line)) {
    return true;
  }

  if (PUBLISHER_HINTS.some((p) => lower.startsWith(p))) {
    return true;
  }

  if (
    lower.includes("series") &&
    !lower.startsWith("by")
  ) {
    return true;
  }

  return false;
}

export function segmentBooks(
  ocrText: string
): BookSegmentationResult {
  const lines = ocrText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const books: DetectedBook[] = [];
  const ignoredLines: string[] = [];

  let current: DetectedBook | null = null;
  let itemNumber = 1;

  for (const line of lines) {
    if (/^book\s*list/i.test(line)) {
      continue;
    }

    if (/^-+$/.test(line)) {
      continue;
    }

    if (looksLikeNewBook(line)) {
      if (current) {
        books.push(current);
      }

      const cleaned = line.replace(
        /^\d+[.)]?\s*/,
        ""
      );

      current = {
        itemNumber,
        rawText: cleaned,
        title: cleaned,
        authors: [],
        confidence: null,
      };

      itemNumber++;

      continue;
    }

    if (/^by\s*:/i.test(line)) {
      if (current) {
        const author = line
          .replace(/^by\s*:/i, "")
          .trim();

        if (author.length > 0) {
          current.authors.push(author);
        }
      }

      continue;
    }

    if (!current) {
      ignoredLines.push(line);
      continue;
    }

    current.rawText += " " + line;
    current.title += " " + line;
  }

  if (current) {
    books.push(current);
  }

  return {
    books,
    ignoredLines,
  };
}