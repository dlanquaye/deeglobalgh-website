/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Logical Row Reconstructor
 * ============================================================
 *
 * Reconstructs logical NaCCA table rows from PDF text lines.
 *
 * The official NaCCA PDF frequently wraps one table record
 * across several physical lines. This class joins those lines
 * without attempting to interpret the individual fields.
 *
 * Examples:
 *
 * 43. Excellence Series English Language for Junior High
 * Schools JHS 2 Excellence Publications and
 * Stationery Ltd
 *
 * becomes:
 *
 * 43. Excellence Series English Language for Junior High
 * Schools JHS 2 Excellence Publications and Stationery Ltd
 *
 * This component:
 *
 * - performs no database writes;
 * - performs no entity resolution;
 * - performs no publisher matching;
 * - performs no subject classification;
 * - performs no import planning.
 *
 * Its only responsibility is rebuilding logical table rows.
 * ============================================================
 */

export interface NaccaLogicalRow {
  /**
   * Serial number printed in the current NaCCA table.
   *
   * Serial numbers restart when a new subject or category
   * section begins, so this value is not globally unique.
   */
  serialNumber: number;

  /**
   * Complete reconstructed row without the leading serial
   * number.
   */
  content: string;

  /**
   * Complete reconstructed row including the serial number.
   */
  rawText: string;

  /**
   * Original cleaned physical lines used to form the row.
   */
  sourceLines: string[];

  /**
   * Zero-based index of the first source line.
   */
  startLineIndex: number;

  /**
   * Zero-based index of the final source line.
   */
  endLineIndex: number;
}

export interface NaccaRowReconstructionResult {
  rows: NaccaLogicalRow[];

  /**
   * Lines encountered outside recognised numbered rows.
   *
   * These include section headings, table headings and other
   * structural content. They are retained for the later
   * section-detection stage.
   */
  structuralLines: NaccaStructuralLine[];

  /**
   * Numbered rows that contained no usable content.
   *
   * The current official document includes at least one empty
   * serial-number row, such as "42.".
   */
  emptyRows: NaccaEmptyRow[];

  ignoredLineCount: number;
}

export interface NaccaStructuralLine {
  text: string;

  lineIndex: number;
}

export interface NaccaEmptyRow {
  serialNumber: number;

  lineIndex: number;

  rawText: string;
}

interface MutableLogicalRow {
  serialNumber: number;

  contentParts: string[];

  sourceLines: string[];

  startLineIndex: number;

  endLineIndex: number;
}

const NUMBERED_ROW_PATTERN =
  /^\s*(\d{1,4})\.\s*(.*)$/;

const PAGE_HEADING_PATTERN =
  /^Page\s*\|\s*\d+$/i;

const PDF_PAGE_FOOTER_PATTERN =
  /^--\s*\d+\s+of\s+\d+\s*--$/i;

const TABLE_HEADING_PATTERN =
  /^S\/N\s+TITLE(?:\s+OF\s+MATERIAL)?\s+LEVEL\s+AUTHOR\/PUBLISHER$/i;

const SECTION_NUMBER_PATTERN =
  /^\d+(?:\.\d+)+\s+\S+/;

const MAIN_SECTION_PATTERN =
  /^\d+\.0\s+\S+/;

const CONTENTS_PATTERN =
  /^CONTENTS$/i;

const MINISTRY_PATTERN =
  /^\(MINISTRY OF EDUCATION\)$/i;

export class NaccaRowReconstructor {
  reconstruct(
    lines: readonly string[],
  ): NaccaRowReconstructionResult {
    const rows: NaccaLogicalRow[] =
      [];

    const structuralLines:
      NaccaStructuralLine[] = [];

    const emptyRows: NaccaEmptyRow[] =
      [];

    let ignoredLineCount = 0;

    let currentRow:
      | MutableLogicalRow
      | null = null;

    const flushCurrentRow = (): void => {
      if (!currentRow) {
        return;
      }

      const logicalRow =
        this.finaliseRow(currentRow);

      if (logicalRow) {
        rows.push(logicalRow);
      } else {
        emptyRows.push({
          serialNumber:
            currentRow.serialNumber,

          lineIndex:
            currentRow.startLineIndex,

          rawText:
            currentRow.sourceLines.join(
              " ",
            ),
        });
      }

      currentRow = null;
    };

    for (
      let lineIndex = 0;
      lineIndex < lines.length;
      lineIndex += 1
    ) {
      const originalLine =
        lines[lineIndex] ?? "";

      const line =
        this.cleanLine(originalLine);

      if (!line) {
        ignoredLineCount += 1;
        continue;
      }

      if (
        this.isAlwaysIgnoredLine(line)
      ) {
        flushCurrentRow();

        ignoredLineCount += 1;
        continue;
      }

      const numberedRowMatch =
        line.match(
          NUMBERED_ROW_PATTERN,
        );

      if (numberedRowMatch) {
        flushCurrentRow();

        const serialNumber =
          Number.parseInt(
            numberedRowMatch[1] ?? "",
            10,
          );

        const initialContent =
          this.cleanContentPart(
            numberedRowMatch[2] ?? "",
          );

        if (
          !Number.isInteger(
            serialNumber,
          ) ||
          serialNumber < 1
        ) {
          structuralLines.push({
            text: line,
            lineIndex,
          });

          continue;
        }

        currentRow = {
          serialNumber,

          contentParts:
            initialContent
              ? [initialContent]
              : [],

          sourceLines: [line],

          startLineIndex:
            lineIndex,

          endLineIndex:
            lineIndex,
        };

        continue;
      }

      if (
        this.isStructuralLine(line)
      ) {
        flushCurrentRow();

        structuralLines.push({
          text: line,
          lineIndex,
        });

        continue;
      }

      if (currentRow) {
        const continuation =
          this.cleanContentPart(line);

        if (continuation) {
          currentRow.contentParts.push(
            continuation,
          );

          currentRow.sourceLines.push(
            line,
          );

          currentRow.endLineIndex =
            lineIndex;
        } else {
          ignoredLineCount += 1;
        }

        continue;
      }

      structuralLines.push({
        text: line,
        lineIndex,
      });
    }

    flushCurrentRow();

    return {
      rows,

      structuralLines,

      emptyRows,

      ignoredLineCount,
    };
  }

  private finaliseRow(
    row: MutableLogicalRow,
  ): NaccaLogicalRow | null {
    const content =
      this.normaliseSpacing(
        row.contentParts.join(" "),
      );

    if (!content) {
      return null;
    }

    return {
      serialNumber:
        row.serialNumber,

      content,

      rawText:
        `${row.serialNumber}. ${content}`,

      sourceLines:
        [...row.sourceLines],

      startLineIndex:
        row.startLineIndex,

      endLineIndex:
        row.endLineIndex,
    };
  }

  private cleanLine(
    value: string,
  ): string {
    return this.normaliseSpacing(
      value
        .replace(/\u00a0/g, " ")
        .replace(/\u200b/g, "")
        .replace(/\ufeff/g, "")
        .trim(),
    );
  }

  private cleanContentPart(
    value: string,
  ): string {
    return this.normaliseSpacing(
      value
        .replace(
          /^[•●▪◦]\s*/,
          "",
        )
        .trim(),
    );
  }

  private normaliseSpacing(
    value: string,
  ): string {
    return value
      .replace(/\s+/g, " ")
      .trim();
  }

  private isAlwaysIgnoredLine(
    line: string,
  ): boolean {
    return (
      PAGE_HEADING_PATTERN.test(
        line,
      ) ||
      PDF_PAGE_FOOTER_PATTERN.test(
        line,
      )
    );
  }

  private isStructuralLine(
    line: string,
  ): boolean {
    if (
      TABLE_HEADING_PATTERN.test(line)
    ) {
      return true;
    }

    if (
      SECTION_NUMBER_PATTERN.test(
        line,
      ) ||
      MAIN_SECTION_PATTERN.test(line)
    ) {
      return true;
    }

    if (
      CONTENTS_PATTERN.test(line) ||
      MINISTRY_PATTERN.test(line)
    ) {
      return true;
    }

    if (
      this.looksLikeSubjectHeading(
        line,
      )
    ) {
      return true;
    }

    return false;
  }

  private looksLikeSubjectHeading(
    line: string,
  ): boolean {
    if (line.length < 4) {
      return false;
    }

    if (
      /[a-z]/.test(line)
    ) {
      return false;
    }

    if (
      !/[A-Z]/.test(line)
    ) {
      return false;
    }

    if (
      /^\d/.test(line)
    ) {
      return false;
    }

    const words =
      line.split(/\s+/);

    if (words.length > 18) {
      return false;
    }

    return (
      line.includes("/") ||
      line.includes("(") ||
      words.length <= 12
    );
  }
}