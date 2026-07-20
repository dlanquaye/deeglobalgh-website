/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Document Section Parser
 * ============================================================
 *
 * Walks through extracted NaCCA PDF lines in document order,
 * detects textbook subject sections, reconstructs logical rows
 * and attaches the active subject context to each parsed book.
 *
 * This component does not:
 *
 * - write to the database;
 * - resolve EKB entity IDs;
 * - create publishers or books;
 * - execute synchronisation;
 * - parse supplementary-resource sections.
 *
 * It currently focuses on the real Section 3.0 textbook table:
 *
 * LIST OF APPROVED TEXTBOOKS FROM KINDERGARTEN TO JHS
 *
 * The parser deliberately ignores similarly named entries in
 * the document table of contents.
 * ============================================================
 */

import {
  NaccaBookRowParseFailure,
  NaccaBookRowParser,
  NaccaParsedBookRow,
} from "./NaccaBookRowParser";

import {
  NaccaLogicalRow,
} from "./NaccaRowReconstructor";

export type NaccaTextbookSubjectCode =
  | "SUB_ENGLISH"
  | "SUB_MATHEMATICS"
  | "SUB_SCIENCE"
  | "SUB_CREATIVE_ARTS"
  | "SUB_GHANAIAN_LANGUAGE"
  | "SUB_HISTORY"
  | "SUB_OWOP"
  | "SUB_RME"
  | "SUB_COMPUTING"
  | "SUB_FRENCH"
  | "SUB_PHYSICAL_EDUCATION"
  | "SUB_CAREER_TECHNOLOGY";

export interface NaccaTextbookSubject {
  code: NaccaTextbookSubjectCode;

  name: string;

  sourceHeading: string;
}

export interface NaccaSubjectBookRecord
  extends NaccaParsedBookRow {
  subjectCode:
    NaccaTextbookSubjectCode;

  subjectName: string;

  subjectHeading: string;
}

export interface NaccaSubjectSection {
  subject:
    NaccaTextbookSubject;

  records:
    NaccaSubjectBookRecord[];

  failures:
    NaccaBookRowParseFailure[];

  startLineIndex: number;

  endLineIndex: number;
}

export interface NaccaDocumentSectionParseResult {
  sections:
    NaccaSubjectSection[];

  records:
    NaccaSubjectBookRecord[];

  failures:
    NaccaBookRowParseFailure[];

  ignoredNumberedRows:
    NaccaLogicalRow[];

  detectedTextbookSection:
    boolean;

  detectedSupplementarySection:
    boolean;
}

interface MutableSubjectSection {
  subject:
    NaccaTextbookSubject;

  records:
    NaccaSubjectBookRecord[];

  failures:
    NaccaBookRowParseFailure[];

  startLineIndex: number;

  endLineIndex: number;
}

interface NumberedRowMatch {
  serialNumber: number;

  content: string;
}

interface SubjectDefinition {
  code:
    NaccaTextbookSubjectCode;

  name:
    string;

  patterns:
    RegExp[];
}

/**
 * This pattern intentionally requires the wording used by the
 * real textbook-table heading.
 *
 * The table of contents only says:
 *
 * 3.0 LIST OF APPROVED TEXTBOOKS (KG-JHS)
 *
 * and must not activate textbook parsing.
 */
const TEXTBOOK_SECTION_PATTERN =
  /^3\.0\s+LIST\s+OF\s+APPROVED\s+TEXTBOOKS\s+FROM\s+KINDERGARTEN\s+TO\s+JHS\b/i;

/**
 * This heading is only evaluated after the real textbook
 * section has already been entered.
 */
/**
 * Some NaCCA editions include the 4.0 heading before the
 * supplementary tables, while others jump directly into
 * subsection headings such as:
 *
 * 4.1 ...
 * 4.2 READERS
 * 4.3 GUIDANCE AND COUNSELLING
 * 4.4 E-LEARNING MATERIALS
 *
 * The textbook importer must stop before any Section 4
 * content begins.
 */
const SUPPLEMENTARY_SECTION_PATTERN =
  /^4(?:\.0\b.*SUPPLEMENTARY|\.[1-9]\b)/i;
const PAGE_HEADING_PATTERN =
  /^Page\s*\|\s*\d+$/i;

const PAGE_FOOTER_PATTERN =
  /^--\s*\d+\s+of\s+\d+\s*--$/i;

const TABLE_HEADING_PATTERN =
  /^S\/N\s+TITLE(?:\s+OF\s+MATERIAL)?\s+LEVEL\s+AUTHOR\/PUBLISHER$/i;

const NUMBERED_ROW_PATTERN =
  /^(\d{1,4})\.\s*(.*)$/;

const SUBJECT_DEFINITIONS:
  readonly SubjectDefinition[] = [
    {
      code:
        "SUB_ENGLISH",

      name:
        "English Language",

      patterns: [
        /^LANGUAGE\s+AND\s+LITERACY\s*\/\s*ENGLISH\s+LANGUAGE/i,
        /^LANGUAGE\s*&\s*LITERACY\s+AND\s+ENGLISH\s+LANGUAGE/i,
        /^ENGLISH\s+LANGUAGE\b/i,
      ],
    },
    {
      code:
        "SUB_MATHEMATICS",

      name:
        "Mathematics",

      patterns: [
        /^NUMERACY\s*\/\s*MATHEMATICS/i,
        /^NUMERACY\s+AND\s+MATHEMATICS/i,
        /^MATHEMATICS\b/i,
      ],
    },
    {
      code:
        "SUB_SCIENCE",

      name:
        "Science",

      patterns: [
        /^SCIENCE\b/i,
      ],
    },
    {
      code:
        "SUB_CREATIVE_ARTS",

      name:
        "Creative Arts",

      patterns: [
        /^CREATIVE\s+ARTS\s+AND\s+DESIGN\b/i,
        /^CREATIVE\s+ARTS\s*&\s*DESIGN\b/i,
        /^CREATIVE\s+ARTS\b/i,
      ],
    },
    {
      code:
        "SUB_GHANAIAN_LANGUAGE",

      name:
        "Ghanaian Language",

      patterns: [
        /^GHANAIAN\s+LANGUAGE\b/i,
      ],
    },
    {
      code:
        "SUB_HISTORY",

      name:
        "History of Ghana",

      patterns: [
        /^HISTORY\s+OF\s+GHANA\b/i,
        /^HISTORY\b/i,
      ],
    },
    {
      code:
        "SUB_OWOP",

      name:
        "Our World and Our People",

      patterns: [
        /^OUR\s+WORLD\s+AND\s+OUR\s+PEOPLE\b/i,
        /^OUR\s+WORLD\s*&\s*OUR\s+PEOPLE\b/i,
      ],
    },
    {
      code:
        "SUB_RME",

      name:
        "Religious and Moral Education",

      patterns: [
        /^RELIGIOUS\s+AND\s+MORAL\s+EDUCATION\b/i,
        /^RELIGIOUS\s*&\s*MORAL\s+EDUCATION\b/i,
      ],
    },
    {
      code:
        "SUB_COMPUTING",

      name:
        "Computing",

      patterns: [
        /^COMPUTING\b/i,
      ],
    },
    {
      code:
        "SUB_FRENCH",

      name:
        "French",

      patterns: [
        /^FRENCH\b/i,
      ],
    },
    {
      code:
        "SUB_PHYSICAL_EDUCATION",

      name:
        "Physical Education and Health",

      patterns: [
        /^PHYSICAL\s+EDUCATION\s+AND\s+HEALTH\b/i,
        /^PHYSICAL\s+EDUCATION\s*&\s*HEALTH\b/i,
      ],
    },
    {
      code:
        "SUB_CAREER_TECHNOLOGY",

      name:
        "Career Technology",

      patterns: [
        /^CAREER\s+TECHNOLOGY\b/i,
      ],
    },
  ];

export class NaccaDocumentSectionParser {
  private readonly rowParser =
    new NaccaBookRowParser();

  parse(
    lines: readonly string[],
  ): NaccaDocumentSectionParseResult {
    const sections:
      NaccaSubjectSection[] = [];

    const records:
      NaccaSubjectBookRecord[] = [];

    const failures:
      NaccaBookRowParseFailure[] = [];

    const ignoredNumberedRows:
      NaccaLogicalRow[] = [];

    let detectedTextbookSection =
      false;

    let detectedSupplementarySection =
      false;

    let insideTextbookSection =
      false;

    let currentSection:
      | MutableSubjectSection
      | null = null;

    let currentRow:
      | NaccaLogicalRow
      | null = null;

    const flushRow = (): void => {
      if (!currentRow) {
        return;
      }

      if (!currentSection) {
        ignoredNumberedRows.push(
          currentRow,
        );

        currentRow = null;

        return;
      }

      const result =
        this.rowParser.parse(
          currentRow,
        );

      currentSection.endLineIndex =
        currentRow.endLineIndex;

      if (result.success) {
        const contextualRecord:
          NaccaSubjectBookRecord = {
            ...result.record,

            subjectCode:
              currentSection.subject.code,

            subjectName:
              currentSection.subject.name,

            subjectHeading:
              currentSection.subject
                .sourceHeading,
          };

        currentSection.records.push(
          contextualRecord,
        );

        records.push(
          contextualRecord,
        );
      } else {
        currentSection.failures.push(
          result,
        );

        failures.push(result);
      }

      currentRow = null;
    };

    const flushSection = (): void => {
      flushRow();

      if (!currentSection) {
        return;
      }

      sections.push({
        subject:
          currentSection.subject,

        records:
          [...currentSection.records],

        failures:
          [...currentSection.failures],

        startLineIndex:
          currentSection.startLineIndex,

        endLineIndex:
          currentSection.endLineIndex,
      });

      currentSection = null;
    };

    for (
      let lineIndex = 0;
      lineIndex < lines.length;
      lineIndex += 1
    ) {
      const line =
        this.cleanLine(
          lines[lineIndex] ?? "",
        );

      if (!line) {
        continue;
      }

      if (
        !insideTextbookSection &&
        TEXTBOOK_SECTION_PATTERN.test(
          line,
        )
      ) {
        flushSection();

        detectedTextbookSection =
          true;

        insideTextbookSection =
          true;

        continue;
      }

      if (
        insideTextbookSection &&
        SUPPLEMENTARY_SECTION_PATTERN.test(
          line,
        )
      ) {
        flushSection();

        detectedSupplementarySection =
          true;

        insideTextbookSection =
          false;

        break;
      }

      if (
        !insideTextbookSection
      ) {
        continue;
      }

      if (
        this.isIgnoredStructuralLine(
          line,
        )
      ) {
        continue;
      }

      const subject =
        this.detectSubject(line);

      if (subject) {
        flushSection();

        currentSection = {
          subject,

          records: [],

          failures: [],

          startLineIndex:
            lineIndex,

          endLineIndex:
            lineIndex,
        };

        continue;
      }

      const numberedRow =
        this.matchNumberedRow(
          line,
        );

      if (numberedRow) {
        flushRow();

        currentRow = {
          serialNumber:
            numberedRow.serialNumber,

          content:
            numberedRow.content,

          rawText:
            numberedRow.content
              ? `${numberedRow.serialNumber}. ${numberedRow.content}`
              : `${numberedRow.serialNumber}.`,

          sourceLines: [line],

          startLineIndex:
            lineIndex,

          endLineIndex:
            lineIndex,
        };

        continue;
      }

      if (currentRow) {
        const continuation =
          this.cleanContinuation(
            line,
          );

        if (continuation) {
          currentRow.content =
            this.normaliseSpacing(
              [
                currentRow.content,
                continuation,
              ].join(" "),
            );

          currentRow.rawText =
            `${currentRow.serialNumber}. ${currentRow.content}`;

          currentRow.sourceLines.push(
            line,
          );

          currentRow.endLineIndex =
            lineIndex;
        }

        continue;
      }

      if (currentSection) {
        currentSection.endLineIndex =
          lineIndex;
      }
    }

    flushSection();

    return {
      sections,

      records,

      failures,

      ignoredNumberedRows,

      detectedTextbookSection,

      detectedSupplementarySection,
    };
  }

  private detectSubject(
    line: string,
  ): NaccaTextbookSubject | null {
    const heading =
      this.normaliseHeading(line);

    for (
      const definition
      of SUBJECT_DEFINITIONS
    ) {
      const matches =
        definition.patterns.some(
          (pattern) =>
            pattern.test(heading),
        );

      if (!matches) {
        continue;
      }

      return {
        code:
          definition.code,

        name:
          definition.name,

        sourceHeading:
          line,
      };
    }

    return null;
  }

  private matchNumberedRow(
    line: string,
  ): NumberedRowMatch | null {
    const match =
      line.match(
        NUMBERED_ROW_PATTERN,
      );

    if (!match) {
      return null;
    }

    const serialNumber =
      Number.parseInt(
        match[1] ?? "",
        10,
      );

    if (
      !Number.isInteger(
        serialNumber,
      ) ||
      serialNumber < 1
    ) {
      return null;
    }

    return {
      serialNumber,

      content:
        this.normaliseSpacing(
          match[2] ?? "",
        ),
    };
  }

  private isIgnoredStructuralLine(
    line: string,
  ): boolean {
    return (
      PAGE_HEADING_PATTERN.test(
        line,
      ) ||
      PAGE_FOOTER_PATTERN.test(
        line,
      ) ||
      TABLE_HEADING_PATTERN.test(
        line,
      )
    );
  }

  private cleanLine(
    value: string,
  ): string {
    return this.normaliseSpacing(
      value
        .replace(/\u00a0/g, " ")
        .replace(/\u200b/g, "")
        .replace(/\ufeff/g, ""),
    );
  }

  private cleanContinuation(
    value: string,
  ): string {
    return this.normaliseSpacing(
      value.replace(
        /^[•●▪◦]\s*/,
        "",
      ),
    );
  }

  private normaliseHeading(
    value: string,
  ): string {
    return this.normaliseSpacing(
      value
        .replace(
          /\([^)]*\)/g,
          " ",
        )
        .replace(
          /[,:;]+/g,
          " ",
        ),
    );
  }

  private normaliseSpacing(
    value: string,
  ): string {
    return value
      .replace(/\s+/g, " ")
      .trim();
  }
}