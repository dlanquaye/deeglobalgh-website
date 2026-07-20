/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * NaCCA Publication Downloader
 * ============================================================
 */

import path from "node:path";

import {
  DownloadManager,
  DownloadResult,
} from "../DownloadManager";

import {
  NaccaPublicationDescriptor,
} from "./types";

export interface NaccaDownloaderOptions {
  cacheDirectory: string;

  downloadManager?: DownloadManager;
}

export class NaccaDownloader {
  private readonly cacheDirectory: string;

  private readonly downloadManager: DownloadManager;

  constructor(
    options: NaccaDownloaderOptions,
  ) {
    this.cacheDirectory =
      path.resolve(
        options.cacheDirectory,
      );

    this.downloadManager =
      options.downloadManager ??
      new DownloadManager();
  }

  async download(
    publication: NaccaPublicationDescriptor,
  ): Promise<DownloadResult> {
    this.validatePublication(
      publication,
    );

    return this.downloadManager.download({
      sourceUrl:
        publication.documentUrl,

      destinationDirectory:
        this.cacheDirectory,

      fileName:
        publication.fileName,

      expectedMimeTypes: [
        publication.expectedMimeType,
      ],
    });
  }

  private validatePublication(
    publication: NaccaPublicationDescriptor,
  ): void {
    if (!publication.title.trim()) {
      throw new Error(
        "NaCCA publication title is required.",
      );
    }

    if (
      !publication.documentUrl.trim()
    ) {
      throw new Error(
        "NaCCA publication document URL is required.",
      );
    }

    if (
      !publication.publicationPageUrl.trim()
    ) {
      throw new Error(
        "NaCCA publication page URL is required.",
      );
    }

    if (
      !publication.expectedMimeType.trim()
    ) {
      throw new Error(
        "NaCCA publication MIME type is required.",
      );
    }

    if (!publication.fileName.trim()) {
      throw new Error(
        "NaCCA publication filename is required.",
      );
    }
  }
}