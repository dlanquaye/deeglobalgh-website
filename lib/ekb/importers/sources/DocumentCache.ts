/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * Source Document Cache
 * ============================================================
 */

import {
  access,
  mkdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";

import path from "node:path";

export interface CachedSourceDocument {
  authority: string;

  title: string;

  version?: string;

  sourceUrl: string;

  localPath: string;

  mimeType: string;

  size: number;

  downloadedAt: string;
}

export interface DocumentCacheOptions {
  cacheDirectory: string;
}

export class DocumentCache {
  private readonly cacheDirectory: string;

  private readonly metadataPath: string;

  constructor(
    options: DocumentCacheOptions,
  ) {
    this.cacheDirectory =
      path.resolve(
        options.cacheDirectory,
      );

    this.metadataPath =
      path.join(
        this.cacheDirectory,
        "documents.json",
      );
  }

  async initialise(): Promise<void> {
    await mkdir(
      this.cacheDirectory,
      {
        recursive: true,
      },
    );

    const exists =
      await this.fileExists(
        this.metadataPath,
      );

    if (!exists) {
      await this.writeDocuments([]);
    }
  }

  async getByAuthority(
    authority: string,
  ): Promise<CachedSourceDocument[]> {
    const normalisedAuthority =
      authority
        .trim()
        .toLowerCase();

    if (!normalisedAuthority) {
      throw new Error(
        "Educational source authority is required.",
      );
    }

    const documents =
      await this.readDocuments();

    return documents.filter(
      (document) =>
        document.authority
          .trim()
          .toLowerCase() ===
        normalisedAuthority,
    );
  }

  async getLatestByAuthority(
    authority: string,
  ): Promise<
    CachedSourceDocument | null
  > {
    const documents =
      await this.getByAuthority(
        authority,
      );

    if (documents.length === 0) {
      return null;
    }

    return [...documents].sort(
      (left, right) =>
        new Date(
          right.downloadedAt,
        ).getTime() -
        new Date(
          left.downloadedAt,
        ).getTime(),
    )[0] ?? null;
  }

  async save(
    document: CachedSourceDocument,
  ): Promise<CachedSourceDocument> {
    await this.initialise();

    await this.validateDocument(
      document,
    );

    const documents =
      await this.readDocuments();

    const existingIndex =
      documents.findIndex(
        (existingDocument) =>
          existingDocument.authority ===
            document.authority &&
          existingDocument.sourceUrl ===
            document.sourceUrl &&
          existingDocument.version ===
            document.version,
      );

    if (existingIndex >= 0) {
      documents[existingIndex] =
        document;
    } else {
      documents.push(document);
    }

    await this.writeDocuments(
      documents,
    );

    return document;
  }

  async isAvailable(
    document:
      | CachedSourceDocument
      | null,
  ): Promise<boolean> {
    if (!document) {
      return false;
    }

    const exists =
      await this.fileExists(
        document.localPath,
      );

    if (!exists) {
      return false;
    }

    const fileStats =
      await stat(
        document.localPath,
      );

    return (
      fileStats.isFile() &&
      fileStats.size > 0
    );
  }

  private async validateDocument(
    document: CachedSourceDocument,
  ): Promise<void> {
    if (!document.authority.trim()) {
      throw new Error(
        "Cached educational source authority is required.",
      );
    }

    if (!document.title.trim()) {
      throw new Error(
        "Cached educational source title is required.",
      );
    }

    if (!document.sourceUrl.trim()) {
      throw new Error(
        "Cached educational source URL is required.",
      );
    }

    if (!document.localPath.trim()) {
      throw new Error(
        "Cached educational source local path is required.",
      );
    }

    if (!document.mimeType.trim()) {
      throw new Error(
        "Cached educational source MIME type is required.",
      );
    }

    if (
      !Number.isFinite(
        document.size,
      ) ||
      document.size <= 0
    ) {
      throw new Error(
        "Cached educational source size must be greater than zero.",
      );
    }

    const downloadedAt =
      new Date(
        document.downloadedAt,
      );

    if (
      Number.isNaN(
        downloadedAt.getTime(),
      )
    ) {
      throw new Error(
        "Cached educational source download date is invalid.",
      );
    }

    const available =
      await this.fileExists(
        document.localPath,
      );

    if (!available) {
      throw new Error(
        `Cached educational source file does not exist: ${document.localPath}`,
      );
    }
  }

  private async readDocuments(): Promise<
    CachedSourceDocument[]
  > {
    await this.initialise();

    const content =
      await readFile(
        this.metadataPath,
        "utf8",
      );

    if (!content.trim()) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(content);

    if (!Array.isArray(parsed)) {
      throw new Error(
        `Invalid educational source cache metadata: ${this.metadataPath}`,
      );
    }

    return parsed as CachedSourceDocument[];
  }

  private async writeDocuments(
    documents:
      CachedSourceDocument[],
  ): Promise<void> {
    await mkdir(
      this.cacheDirectory,
      {
        recursive: true,
      },
    );

    await writeFile(
      this.metadataPath,
      JSON.stringify(
        documents,
        null,
        2,
      ),
      "utf8",
    );
  }

  private async fileExists(
    filePath: string,
  ): Promise<boolean> {
    try {
      await access(filePath);

      return true;
    } catch {
      return false;
    }
  }
}