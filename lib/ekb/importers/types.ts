/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * Import Types
 * ============================================================
 */

export interface NaccaBookRecord {
  publisher: string;

  title: string;

  subject: string;

  level: string;

  resourceType: string;

  language?: string;

  curriculum?: string;

  isbn?: string;

  authors: string[];
}

export interface ImportSummary {
  publishers: number;

  bookLines: number;

  books: number;

  authors: number;

  skipped: number;
}