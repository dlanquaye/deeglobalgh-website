/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * NaCCA Document Parser
 * ============================================================
 */

import {
  readFile,
  stat,
} from "node:fs/promises";

import path from "node:path";

import {
  PDFParse,
} from "pdf-parse";

export interface NaccaParsedDocument {
  /**
   * Absolute path of the parsed PDF.
   */
  localPath: string;

  /**
   * Normalised text extracted from the complete document.
   */
  text: string;

  /**
   * Number of pages reported by the PDF parser.
   */
  pageCount: number;

  /**
   * Size of the source PDF in bytes.
   */
  size: number;

  /**
   * Time at which parsing completed.
   */
  parsedAt: Date;
}

export class NaccaDocumentParser {
  async parse(
    localPath: string,
  ): Promise<NaccaParsedDocument> {
    const resolvedPath =
      await this.validateDocument(
        localPath,
      );

    const fileStats =
      await stat(resolvedPath);

    const fileBuffer =
      await readFile(resolvedPath);

    this.validatePdfSignature(
      fileBuffer,
      resolvedPath,
    );

    const parser =
      new PDFParse({
        data: fileBuffer,
      });

    try {
      const result =
        await parser.getText();

      const text =
        this.normaliseText(
          result.text,
        );

      if (!text) {
        throw new Error(
          [
            "NaCCA PDF text extraction produced no readable text.",
            `Document: ${resolvedPath}`,
            "The publication may be image-only, encrypted or malformed.",
          ].join(" "),
        );
      }

      return {
        localPath:
          resolvedPath,

        text,

        pageCount:
          this.normalisePageCount(
            result.total,
          ),

        size:
          fileStats.size,

        parsedAt:
          new Date(),
      };
    } catch (error) {
      throw new Error(
        [
          "Failed to parse NaCCA source document.",
          `Document: ${resolvedPath}`,
          `Reason: ${this.getErrorMessage(error)}`,
        ].join(" "),
        {
          cause: error,
        },
      );
    } finally {
      await parser.destroy();
    }
  }

  private async validateDocument(
    localPath: string,
  ): Promise<string> {
    const trimmedPath =
      localPath.trim();

    if (!trimmedPath) {
      throw new Error(
        "NaCCA source document path is required.",
      );
    }

    const resolvedPath =
      path.resolve(
        trimmedPath,
      );

    let fileStats;

    try {
      fileStats =
        await stat(resolvedPath);
    } catch {
      throw new Error(
        `NaCCA source document does not exist: ${resolvedPath}`,
      );
    }

    if (!fileStats.isFile()) {
      throw new Error(
        `NaCCA source document is not a file: ${resolvedPath}`,
      );
    }

    if (fileStats.size <= 0) {
      throw new Error(
        `NaCCA source document is empty: ${resolvedPath}`,
      );
    }

    if (
      path
        .extname(resolvedPath)
        .toLowerCase() !==
      ".pdf"
    ) {
      throw new Error(
        `NaCCA source document must be a PDF: ${resolvedPath}`,
      );
    }

    return resolvedPath;
  }

  private validatePdfSignature(
    fileBuffer: Buffer,
    localPath: string,
  ): void {
    if (fileBuffer.length < 5) {
      throw new Error(
        `NaCCA source document is too small to be a valid PDF: ${localPath}`,
      );
    }

    const signature =
      fileBuffer
        .subarray(0, 5)
        .toString("ascii");

    if (signature !== "%PDF-") {
      throw new Error(
        [
          "NaCCA source document does not contain a valid PDF signature.",
          `Document: ${localPath}`,
          `Signature received: ${JSON.stringify(signature)}`,
        ].join(" "),
      );
    }
  }

  private normaliseText(
    value: string | undefined,
  ): string {
    if (!value) {
      return "";
    }

    return value
      .replace(/\u0000/g, "")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u00a0\u2007\u202f]/g, " ")
      .split("\n")
      .map((line) =>
        line
          .replace(/[ \t]+/g, " ")
          .trim(),
      )
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private normalisePageCount(
    value: number | undefined,
  ): number {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      return 0;
    }

    return Math.trunc(value);
  }

  private getErrorMessage(
    error: unknown,
  ): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Unknown PDF parsing error.";
  }
}