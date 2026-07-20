/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * NaCCA Source Types
 * ============================================================
 */

export interface NaccaPublicationDescriptor {
  /**
   * Human-readable title published by NaCCA.
   */
  title: string;

  /**
   * Direct URL to the official downloadable publication.
   */
  documentUrl: string;

  /**
   * NaCCA webpage from which the publication was discovered.
   */
  publicationPageUrl: string;

  /**
   * Publication version, edition or year where available.
   */
  version?: string;

  /**
   * Publication date where available.
   */
  publishedAt?: string;

  /**
   * MIME type expected from the downloadable document.
   */
  expectedMimeType: string;

  /**
   * Deterministic filename used in the local cache.
   */
  fileName: string;
}

export interface NaccaSourceOptions {
  /**
   * Directory used for downloaded NaCCA source documents.
   */
  cacheDirectory: string;

  /**
   * Optional direct publication URL override.
   *
   * This allows an administrator to temporarily point the
   * importer at a confirmed official NaCCA publication without
   * changing application code.
   */
  publicationUrlOverride?: string;

  /**
   * Optional direct document URL override.
   *
   * This is useful when NaCCA changes its publication webpage
   * structure but the official downloadable document URL is known.
   */
  documentUrlOverride?: string;

  /**
   * Optional publication version override.
   */
  versionOverride?: string;

  /**
   * When true, an existing valid cached document may be reused.
   */
  allowCachedDocument?: boolean;
}

export interface NaccaPublicationDiscoveryResult {
  publication: NaccaPublicationDescriptor;

  discoveredAt: Date;

  discoveryMethod:
    | "official-page"
    | "publication-override"
    | "document-override";
}