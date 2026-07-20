/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * NaCCA Import Reader
 * ============================================================
 *
 * Reads the official NaCCA instructional-resource document,
 * extracts structured textbook records and converts them into
 * the standard EKB importer contract.
 *
 * Pipeline:
 *
 * NaccaSource
 * → cached local document
 * → NaccaDocumentParser
 * → NaccaDocumentSectionParser
 * → parseNaccaRecords
 *
 * This reader does not:
 *
 * - write to the database;
 * - resolve EKB entities;
 * - create publishers, books or editions;
 * - build synchronisation plans.
 * ============================================================
 */

import {
  ImportReader,
} from "./reader";

import {
  NaccaBookRecord,
} from "../types";

import {
  parseNaccaRecords,
} from "../parser";

import {
  NaccaSource,
} from "../sources/nacca/NaccaSource";

import {
  NaccaDocumentParser,
} from "../sources/nacca/NaccaDocumentParser";

import {
  NaccaDocumentSectionParser,
} from "../sources/nacca/NaccaDocumentSectionParser";

export interface NaccaReaderOptions {
  cacheDirectory: string;

  allowCachedDocument?: boolean;
}

export class NaccaReader
  implements ImportReader {
  private readonly source:
    NaccaSource;

  private readonly documentParser =
    new NaccaDocumentParser();

  private readonly sectionParser =
    new NaccaDocumentSectionParser();

  constructor(
    options:
      NaccaReaderOptions,
  ) {
    this.source =
      new NaccaSource({
        cacheDirectory:
          options.cacheDirectory,

        allowCachedDocument:
          options.allowCachedDocument,
      });
  }

  async read():
    Promise<NaccaBookRecord[]> {
    const sourceDocument =
      await this.source.fetchLatest();

    const parsedDocument =
      await this.documentParser.parse(
        sourceDocument.localPath,
      );

    const lines =
      parsedDocument.text.split(
        /\r?\n/,
      );

    const sectionResult =
      this.sectionParser.parse(
        lines,
      );

    if (
      !sectionResult
        .detectedTextbookSection
    ) {
      throw new Error(
        [
          "The official NaCCA textbook section was not detected.",
          `Document: ${sourceDocument.localPath}`,
        ].join(" "),
      );
    }

    return parseNaccaRecords(
      sectionResult.records,
    );
  }
}