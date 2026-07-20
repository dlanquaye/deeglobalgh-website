/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * NaCCA Educational Source
 * ============================================================
 */

import path from "node:path";

import {
  EducationalSource,
  SourceDocument,
} from "../Source";

import {
  CachedSourceDocument,
  DocumentCache,
} from "../DocumentCache";

import {
  NaccaDownloader,
} from "./NaccaDownloader";

import {
  NaccaPublicationDescriptor,
  NaccaSourceOptions,
} from "./types";

const NACCA_AUTHORITY =
  "NaCCA";

const DEFAULT_PUBLICATION_PAGE_URL =
  "https://nacca.gov.gh/approved-books-registry/";

const DEFAULT_DOCUMENT_URL =
  "https://nacca.gov.gh/wp-content/uploads/2025/01/NaCCA_List_of_Approved_Instructional_Resources_Textbooks_and_Supplementary.pdf";

const DEFAULT_PUBLICATION_TITLE =
  "NaCCA List of Approved Instructional Resources";

const DEFAULT_PUBLICATION_VERSION =
  "2025-01";

const DEFAULT_MIME_TYPE =
  "application/pdf";

const DEFAULT_FILE_NAME =
  "nacca-approved-instructional-resources-2025-01.pdf";

export class NaccaSource
  implements EducationalSource
{
  private readonly options: NaccaSourceOptions;

  private readonly documentCache: DocumentCache;

  private readonly downloader: NaccaDownloader;

  constructor(
    options: NaccaSourceOptions,
  ) {
    this.options =
      this.validateOptions(options);

    this.documentCache =
      new DocumentCache({
        cacheDirectory:
          this.options.cacheDirectory,
      });

    this.downloader =
      new NaccaDownloader({
        cacheDirectory:
          this.options.cacheDirectory,
      });
  }

  async fetchLatest(): Promise<SourceDocument> {
    await this.documentCache.initialise();

    if (
      this.options.allowCachedDocument !==
      false
    ) {
      const cachedDocument =
        await this.documentCache
          .getLatestByAuthority(
            NACCA_AUTHORITY,
          );

      const cacheAvailable =
        await this.documentCache
          .isAvailable(
            cachedDocument,
          );

      if (
        cachedDocument &&
        cacheAvailable &&
        this.canReuseCachedDocument(
          cachedDocument,
        )
      ) {
        return this.toSourceDocument(
          cachedDocument,
        );
      }
    }

    const publication =
      this.buildPublicationDescriptor();

    const downloadResult =
      await this.downloader.download(
        publication,
      );

    const cachedDocument:
      CachedSourceDocument = {
        authority:
          NACCA_AUTHORITY,

        title:
          publication.title,

        version:
          publication.version,

        sourceUrl:
          publication.documentUrl,

        localPath:
          downloadResult.localPath,

        mimeType:
          downloadResult.mimeType,

        size:
          downloadResult.size,

        downloadedAt:
          downloadResult.downloadedAt
            .toISOString(),
      };

    await this.documentCache.save(
      cachedDocument,
    );

    return this.toSourceDocument(
      cachedDocument,
    );
  }

  private buildPublicationDescriptor():
    NaccaPublicationDescriptor {
    const publicationPageUrl =
      this.options
        .publicationUrlOverride
        ?.trim() ||
      DEFAULT_PUBLICATION_PAGE_URL;

    const documentUrl =
      this.options
        .documentUrlOverride
        ?.trim() ||
      DEFAULT_DOCUMENT_URL;

    const version =
      this.options
        .versionOverride
        ?.trim() ||
      DEFAULT_PUBLICATION_VERSION;

    return {
      title:
        DEFAULT_PUBLICATION_TITLE,

      documentUrl,

      publicationPageUrl,

      version,

      expectedMimeType:
        DEFAULT_MIME_TYPE,

      fileName:
        this.buildFileName(version),
    };
  }

  private buildFileName(
    version: string,
  ): string {
    if (
      version ===
      DEFAULT_PUBLICATION_VERSION
    ) {
      return DEFAULT_FILE_NAME;
    }

    const safeVersion =
      version
        .trim()
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "-",
        )
        .replace(
          /-+/g,
          "-",
        )
        .replace(
          /^-|-$/g,
          "",
        );

    if (!safeVersion) {
      return DEFAULT_FILE_NAME;
    }

    return [
      "nacca-approved-",
      "instructional-resources-",
      safeVersion,
      ".pdf",
    ].join("");
  }

  private canReuseCachedDocument(
    cachedDocument:
      CachedSourceDocument,
  ): boolean {
    const expectedDocumentUrl =
      this.options
        .documentUrlOverride
        ?.trim();

    if (
      expectedDocumentUrl &&
      cachedDocument.sourceUrl !==
        expectedDocumentUrl
    ) {
      return false;
    }

    const expectedVersion =
      this.options
        .versionOverride
        ?.trim();

    if (
      expectedVersion &&
      cachedDocument.version !==
        expectedVersion
    ) {
      return false;
    }

    return true;
  }

  private toSourceDocument(
    cachedDocument:
      CachedSourceDocument,
  ): SourceDocument {
    return {
      authority:
        cachedDocument.authority,

      title:
        cachedDocument.title,

      version:
        cachedDocument.version,

      sourceUrl:
        cachedDocument.sourceUrl,

      localPath:
        cachedDocument.localPath,

      mimeType:
        cachedDocument.mimeType,
    };
  }

  private validateOptions(
    options: NaccaSourceOptions,
  ): NaccaSourceOptions {
    if (
      !options ||
      !options.cacheDirectory?.trim()
    ) {
      throw new Error(
        "NaCCA source cache directory is required.",
      );
    }

    return {
      ...options,

      cacheDirectory:
        path.resolve(
          options.cacheDirectory,
        ),

      publicationUrlOverride:
        this.normaliseOptionalUrl(
          options
            .publicationUrlOverride,
          "NaCCA publication page",
        ),

      documentUrlOverride:
        this.normaliseOptionalUrl(
          options
            .documentUrlOverride,
          "NaCCA publication document",
        ),

      versionOverride:
        options
          .versionOverride
          ?.trim() ||
        undefined,
    };
  }

  private normaliseOptionalUrl(
    value: string | undefined,
    label: string,
  ): string | undefined {
    const trimmedValue =
      value?.trim();

    if (!trimmedValue) {
      return undefined;
    }

    let url: URL;

    try {
      url = new URL(
        trimmedValue,
      );
    } catch {
      throw new Error(
        `${label} URL is invalid: ${trimmedValue}`,
      );
    }

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      throw new Error(
        `${label} URL must use HTTP or HTTPS.`,
      );
    }

    return url.toString();
  }
}