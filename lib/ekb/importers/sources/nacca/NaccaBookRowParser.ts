/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Book Row Parser
 * ============================================================
 *
 * Converts reconstructed NaCCA logical rows into structured
 * textbook records.
 *
 * Input example:
 *
 * 24. Golden English for Basic Schools Basic 4
 * New Golden Publications
 *
 * Output:
 *
 * {
 *   serialNumber: 24,
 *   title: "Golden English for Basic Schools",
 *   level: "Basic 4",
 *   publisher: "New Golden Publications"
 * }
 *
 * This parser does not:
 *
 * - write to the database;
 * - resolve publishers against the EKB;
 * - create educational entities;
 * - create synchronisation plans;
 * - determine the current subject section.
 *
 * Subject assignment will be handled by the document-section
 * parser because the subject is supplied by the surrounding
 * heading rather than by every individual table row.
 * ============================================================
 */

import {
  NaccaLogicalRow,
} from "./NaccaRowReconstructor";

export type NaccaParsedLevel =
  | "KG 1"
  | "KG 2"
  | "Basic 1"
  | "Basic 2"
  | "Basic 3"
  | "Basic 4"
  | "Basic 5"
  | "Basic 6"
  | "JHS 1"
  | "JHS 2"
  | "JHS 3";

export interface NaccaParsedBookRow {
  serialNumber: number;

  title: string;

  level: NaccaParsedLevel;

  publisher: string;

  rawText: string;

  sourceLines: string[];

  startLineIndex: number;

  endLineIndex: number;
}

export type NaccaBookRowParseFailureReason =
  | "EMPTY_CONTENT"
  | "LEVEL_NOT_FOUND"
  | "TITLE_NOT_FOUND"
  | "PUBLISHER_NOT_FOUND";

export interface NaccaBookRowParseFailure {
  success: false;

  row: NaccaLogicalRow;

  reason: NaccaBookRowParseFailureReason;

  message: string;
}

export interface NaccaBookRowParseSuccess {
  success: true;

  record: NaccaParsedBookRow;
}

export type NaccaBookRowParseResult =
  | NaccaBookRowParseSuccess
  | NaccaBookRowParseFailure;

interface LocatedLevel {
  level: NaccaParsedLevel;

  startIndex: number;

  endIndex: number;

  priority: number;
}

interface LevelPattern {
  pattern: RegExp;

  priority: number;

  normalise: (
    match: RegExpExecArray,
  ) => NaccaParsedLevel;
}

/**
 * Levels represented in the official NaCCA standards-based
 * curriculum textbook tables.
 *
 * Explicit curriculum labels receive the highest priority:
 *
 * - Basic 4
 * - Primary 4
 * - JHS 1
 * - Kindergarten 2
 *
 * Some NaCCA rows omit the curriculum label and use only the
 * book number:
 *
 * - Learner's Book 4
 * - Activity Book 5
 * - Course Book 6
 * - Book 4
 *
 * In the KG-to-JHS textbook tables, unqualified Book 1-6
 * references are normalised to Basic 1-6. Explicit JHS and KG
 * labels always take precedence.
 */
const LEVEL_PATTERNS:
  readonly LevelPattern[] = [
    {
      pattern:
        /\bKINDERGARTEN\s*([12])\b/gi,

      priority:
        100,

      normalise: (match) =>
        `KG ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\bKG\s*[-–—]?\s*([12])\b/gi,

      priority:
        100,

      normalise: (match) =>
        `KG ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\bBASIC\s*[-–—]?\s*([1-6])\b/gi,

      priority:
        100,

      normalise: (match) =>
        `Basic ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\bPRIMARY\s*[-–—]?\s*([1-6])\b/gi,

      priority:
        100,

      normalise: (match) =>
        `Basic ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\bJUNIOR\s+HIGH\s+SCHOOL\s*[-–—]?\s*([1-3])\b/gi,

      priority:
        100,

      normalise: (match) =>
        `JHS ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\bJUNIOR\s+HIGH\s*[-–—]?\s*([1-3])\b/gi,

      priority:
        100,

      normalise: (match) =>
        `JHS ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\bJHS\s*[-–—]?\s*([1-3])\b/gi,

      priority:
        100,

      normalise: (match) =>
        `JHS ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\b(?:LEARNER(?:'|’)?S?|PUPIL(?:'|’)?S?|STUDENT(?:'|’)?S?)\s+BOOK\s*[-–—]?\s*([1-6])\b/gi,

      priority:
        80,

      normalise: (match) =>
        `Basic ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\b(?:ACTIVITY|COURSE|TEXT|WORK|EXERCISE|PRACTICE)\s*BOOK\s*[-–—]?\s*([1-6])\b/gi,

      priority:
        80,

      normalise: (match) =>
        `Basic ${match[1]}` as NaccaParsedLevel,
    },
    {
      pattern:
        /\bBOOK\s*[-–—]?\s*([1-6])\b/gi,

      priority:
        60,

      normalise: (match) =>
        `Basic ${match[1]}` as NaccaParsedLevel,
    },
  ];

export class NaccaBookRowParser {
  parse(
    row: NaccaLogicalRow,
  ): NaccaBookRowParseResult {
    const content =
      this.normaliseSpacing(
        row.content,
      );

    if (!content) {
      return this.failure(
        row,
        "EMPTY_CONTENT",
        `NaCCA row ${row.serialNumber} contains no usable content.`,
      );
    }

    const locatedLevel =
      this.findLevel(content);

    if (!locatedLevel) {
      return this.failure(
        row,
        "LEVEL_NOT_FOUND",
        [
          `No recognised educational level was found in NaCCA row ${row.serialNumber}.`,
          `Content: ${content}`,
        ].join(" "),
      );
    }

    const title =
      this.cleanTitle(
        content.slice(
          0,
          locatedLevel.startIndex,
        ),
      );

    if (!title) {
      return this.failure(
        row,
        "TITLE_NOT_FOUND",
        [
          `No textbook title was found before the level in NaCCA row ${row.serialNumber}.`,
          `Content: ${content}`,
        ].join(" "),
      );
    }

    const publisher =
      this.cleanPublisher(
        content.slice(
          locatedLevel.endIndex,
        ),
      );

    if (!publisher) {
      return this.failure(
        row,
        "PUBLISHER_NOT_FOUND",
        [
          `No publisher was found after the level in NaCCA row ${row.serialNumber}.`,
          `Content: ${content}`,
        ].join(" "),
      );
    }

    return {
      success: true,

      record: {
        serialNumber:
          row.serialNumber,

        title,

        level:
          locatedLevel.level,

        publisher,

        rawText:
          row.rawText,

        sourceLines:
          [...row.sourceLines],

        startLineIndex:
          row.startLineIndex,

        endLineIndex:
          row.endLineIndex,
      },
    };
  }

  parseMany(
    rows: readonly NaccaLogicalRow[],
  ): {
    records: NaccaParsedBookRow[];

    failures: NaccaBookRowParseFailure[];
  } {
    const records:
      NaccaParsedBookRow[] = [];

    const failures:
      NaccaBookRowParseFailure[] = [];

    for (const row of rows) {
      const result =
        this.parse(row);

      if (result.success) {
        records.push(
          result.record,
        );
      } else {
        failures.push(result);
      }
    }

    return {
      records,

      failures,
    };
  }

  private findLevel(
    content: string,
  ): LocatedLevel | null {
    const candidates:
      LocatedLevel[] = [];

    for (
      const levelPattern
      of LEVEL_PATTERNS
    ) {
      levelPattern.pattern.lastIndex =
        0;

      let match:
        | RegExpExecArray
        | null;

      while (
        (
          match =
            levelPattern.pattern.exec(
              content,
            )
        ) !== null
      ) {
        candidates.push({
          level:
            levelPattern.normalise(
              match,
            ),

          startIndex:
            match.index,

          endIndex:
            match.index +
            match[0].length,

          priority:
            levelPattern.priority,
        });

        if (
          match[0].length === 0
        ) {
          levelPattern.pattern.lastIndex +=
            1;
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    /*
     * Explicit curriculum labels are preferred over inferred
     * book-number labels.
     *
     * Within the same confidence tier, the right-most match is
     * used because the official table places the actual level
     * between the title and publisher. Titles may themselves
     * contain words such as Basic, Primary or Book.
     */
    candidates.sort(
      (left, right) => {
        if (
          left.priority !==
          right.priority
        ) {
          return (
            right.priority -
            left.priority
          );
        }

        if (
          left.startIndex !==
          right.startIndex
        ) {
          return (
            right.startIndex -
            left.startIndex
          );
        }

        return (
          right.endIndex -
          left.endIndex
        );
      },
    );

    return candidates[0] ?? null;
  }

  private cleanTitle(
    value: string,
  ): string {
    return this.normaliseSpacing(
      value
        .replace(
          /^[\s:;,\-–—]+/,
          "",
        )
        .replace(
          /[\s:;,\-–—]+$/,
          "",
        ),
    );
  }

  private cleanPublisher(
    value: string,
  ): string {
    return this.normaliseSpacing(
      value
        .replace(
          /^[\s:;,\-–—]+/,
          "",
        )
        .replace(
          /[\s:;,\-–—]+$/,
          "",
        ),
    );
  }

  private normaliseSpacing(
    value: string,
  ): string {
    return value
      .replace(/\u00a0/g, " ")
      .replace(/\u200b/g, "")
      .replace(/\ufeff/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private failure(
    row: NaccaLogicalRow,
    reason:
      NaccaBookRowParseFailureReason,
    message: string,
  ): NaccaBookRowParseFailure {
    return {
      success: false,

      row,

      reason,

      message,
    };
  }
}