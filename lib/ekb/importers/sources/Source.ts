/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * Import Source Contract
 * ============================================================
 */

export interface SourceDocument {
  /**
   * Source authority.
   * Example:
   *  - NaCCA
   *  - GES
   *  - WAEC
   */
  authority: string;

  /**
   * Human readable document title.
   */
  title: string;

  /**
   * Version or publication date.
   */
  version?: string;

  /**
   * Original download URL.
   */
  sourceUrl: string;

  /**
   * Local cached filename.
   */
  localPath: string;

  /**
   * MIME type.
   */
  mimeType: string;
}

export interface EducationalSource {
  /**
   * Downloads or retrieves the latest
   * official document for this authority.
   */
  fetchLatest(): Promise<SourceDocument>;
}