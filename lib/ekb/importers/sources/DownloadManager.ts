/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * Download Manager
 * ============================================================
 */

import {
  mkdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";

import {
  get as httpGet,
  IncomingMessage,
} from "node:http";

import {
  get as httpsGet,
} from "node:https";

import path from "node:path";

export interface DownloadRequest {
  sourceUrl: string;

  destinationDirectory: string;

  fileName: string;

  expectedMimeTypes?: string[];

  timeoutMilliseconds?: number;

  maximumRedirects?: number;
}

export interface DownloadResult {
  sourceUrl: string;

  localPath: string;

  fileName: string;

  mimeType: string;

  size: number;

  downloadedAt: Date;
}

interface DownloadResponse {
  finalUrl: string;

  mimeType: string;

  content: Buffer;
}

const DEFAULT_TIMEOUT_MILLISECONDS =
  30_000;

const DEFAULT_MAXIMUM_REDIRECTS =
  5;

export class DownloadManager {
  async download(
    request: DownloadRequest,
  ): Promise<DownloadResult> {
    const sourceUrl =
      this.validateSourceUrl(
        request.sourceUrl,
      );

    const fileName =
      this.sanitiseFileName(
        request.fileName,
      );

    const destinationDirectory =
      path.resolve(
        request.destinationDirectory,
      );

    const timeoutMilliseconds =
      this.validateTimeout(
        request.timeoutMilliseconds,
      );

    const maximumRedirects =
      this.validateMaximumRedirects(
        request.maximumRedirects,
      );

    await mkdir(
      destinationDirectory,
      {
        recursive: true,
      },
    );

    const response =
      await this.requestDocument(
        sourceUrl,
        request.expectedMimeTypes,
        timeoutMilliseconds,
        maximumRedirects,
      );

    this.validateMimeType(
      response.mimeType,
      request.expectedMimeTypes,
    );

    if (response.content.length === 0) {
      throw new Error(
        `Downloaded educational source document is empty: ${response.finalUrl}`,
      );
    }

    const localPath =
      path.join(
        destinationDirectory,
        fileName,
      );

    const temporaryPath =
      `${localPath}.${Date.now()}.tmp`;

    try {
      await writeFile(
        temporaryPath,
        response.content,
      );

      await rm(localPath, {
        force: true,
      });

      await rename(
        temporaryPath,
        localPath,
      );
    } catch (error) {
      await rm(temporaryPath, {
        force: true,
      });

      throw error;
    }

    return {
      sourceUrl:
        response.finalUrl,

      localPath,

      fileName,

      mimeType:
        response.mimeType,

      size:
        response.content.length,

      downloadedAt:
        new Date(),
    };
  }

  private requestDocument(
    sourceUrl: string,
    expectedMimeTypes:
      | string[]
      | undefined,
    timeoutMilliseconds: number,
    redirectsRemaining: number,
  ): Promise<DownloadResponse> {
    return new Promise(
      (resolve, reject) => {
        const url =
          new URL(sourceUrl);

        const requestFunction =
          url.protocol === "https:"
            ? httpsGet
            : httpGet;

        const request =
          requestFunction(
            url,
            {
              headers: {
                Accept:
                  expectedMimeTypes?.join(
                    ", ",
                  ) ??
                  "*/*",

                "User-Agent":
                  "DeeglobalGH-Educational-Knowledge-Platform/1.0",
              },
            },
            (response) => {
              this.handleResponse(
                response,
                sourceUrl,
                expectedMimeTypes,
                timeoutMilliseconds,
                redirectsRemaining,
              )
                .then(resolve)
                .catch(reject);
            },
          );

        request.setTimeout(
          timeoutMilliseconds,
          () => {
            request.destroy(
              new Error(
                [
                  "Educational source download timed out.",
                  `URL: ${sourceUrl}`,
                  `Timeout: ${timeoutMilliseconds}ms`,
                ].join(" "),
              ),
            );
          },
        );

        request.on(
          "error",
          (error) => {
            reject(
              new Error(
                [
                  "Failed to download educational source document.",
                  `URL: ${sourceUrl}`,
                  `Reason: ${this.getErrorMessage(error)}`,
                ].join(" "),
                {
                  cause: error,
                },
              ),
            );
          },
        );
      },
    );
  }

  private async handleResponse(
    response: IncomingMessage,
    sourceUrl: string,
    expectedMimeTypes:
      | string[]
      | undefined,
    timeoutMilliseconds: number,
    redirectsRemaining: number,
  ): Promise<DownloadResponse> {
    const statusCode =
      response.statusCode ?? 0;

    if (
      statusCode >= 300 &&
      statusCode < 400
    ) {
      const location =
        response.headers.location;

      response.resume();

      if (!location) {
        throw new Error(
          [
            "Educational source returned a redirect without a location.",
            `URL: ${sourceUrl}`,
            `Status: ${statusCode}`,
          ].join(" "),
        );
      }

      if (redirectsRemaining <= 0) {
        throw new Error(
          [
            "Educational source exceeded the maximum redirect limit.",
            `URL: ${sourceUrl}`,
          ].join(" "),
        );
      }

      const redirectedUrl =
        new URL(
          location,
          sourceUrl,
        ).toString();

      return this.requestDocument(
        redirectedUrl,
        expectedMimeTypes,
        timeoutMilliseconds,
        redirectsRemaining - 1,
      );
    }

    if (
      statusCode < 200 ||
      statusCode >= 300
    ) {
      response.resume();

      throw new Error(
        [
          "Failed to download educational source document.",
          `URL: ${sourceUrl}`,
          `Status: ${statusCode}`,
          `Message: ${response.statusMessage ?? "Unknown"}`,
        ].join(" "),
      );
    }

    const mimeType =
      this.normaliseMimeType(
        response.headers[
          "content-type"
        ],
      );

    const chunks:
      Buffer[] = [];

    for await (
      const chunk of response
    ) {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk),
      );
    }

    return {
      finalUrl:
        sourceUrl,

      mimeType,

      content:
        Buffer.concat(chunks),
    };
  }

  private validateSourceUrl(
    sourceUrl: string,
  ): string {
    let url: URL;

    try {
      url = new URL(sourceUrl);
    } catch {
      throw new Error(
        `Invalid educational source URL: ${sourceUrl}`,
      );
    }

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      throw new Error(
        `Unsupported educational source protocol: ${url.protocol}`,
      );
    }

    return url.toString();
  }

  private sanitiseFileName(
    fileName: string,
  ): string {
    const trimmed =
      fileName.trim();

    if (!trimmed) {
      throw new Error(
        "Educational source filename is required.",
      );
    }

    const sanitised =
      path
        .basename(trimmed)
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "_",
        );

    if (
      !sanitised ||
      sanitised === "." ||
      sanitised === ".."
    ) {
      throw new Error(
        `Invalid educational source filename: ${fileName}`,
      );
    }

    return sanitised;
  }

  private normaliseMimeType(
    contentType:
      | string
      | string[]
      | undefined,
  ): string {
    const value =
      Array.isArray(contentType)
        ? contentType[0]
        : contentType;

    if (!value) {
      return "application/octet-stream";
    }

    return (
      value
        .split(";")[0]
        ?.trim()
        .toLowerCase() ||
      "application/octet-stream"
    );
  }

  private validateMimeType(
    mimeType: string,
    expectedMimeTypes:
      | string[]
      | undefined,
  ): void {
    if (
      !expectedMimeTypes ||
      expectedMimeTypes.length === 0
    ) {
      return;
    }

    const normalisedExpected =
      expectedMimeTypes.map(
        (expectedMimeType) =>
          expectedMimeType
            .trim()
            .toLowerCase(),
      );

    if (
      normalisedExpected.includes(
        mimeType,
      )
    ) {
      return;
    }

    throw new Error(
      [
        "Downloaded educational source document has an unexpected MIME type.",
        `Expected: ${normalisedExpected.join(", ")}`,
        `Received: ${mimeType}`,
      ].join(" "),
    );
  }

  private validateTimeout(
    timeoutMilliseconds:
      | number
      | undefined,
  ): number {
    if (
      timeoutMilliseconds ===
      undefined
    ) {
      return DEFAULT_TIMEOUT_MILLISECONDS;
    }

    if (
      !Number.isFinite(
        timeoutMilliseconds,
      ) ||
      timeoutMilliseconds <= 0
    ) {
      throw new Error(
        "Educational source timeout must be greater than zero.",
      );
    }

    return Math.trunc(
      timeoutMilliseconds,
    );
  }

  private validateMaximumRedirects(
    maximumRedirects:
      | number
      | undefined,
  ): number {
    if (
      maximumRedirects ===
      undefined
    ) {
      return DEFAULT_MAXIMUM_REDIRECTS;
    }

    if (
      !Number.isInteger(
        maximumRedirects,
      ) ||
      maximumRedirects < 0
    ) {
      throw new Error(
        "Educational source maximum redirects must be a non-negative integer.",
      );
    }

    return maximumRedirects;
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

    return "Unknown network error.";
  }
}