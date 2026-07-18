export interface DetectedBook {
  /**
   * Position in the uploaded school list.
   * Example: 1, 2, 3...
   */
  itemNumber: number;

  /**
   * Original OCR text for this detected book.
   */
  rawText: string;

  /**
   * Cleaned title before matching.
   */
  title: string;

  /**
   * Author names extracted from the OCR.
   */
  authors: string[];

  /**
   * OCR confidence (0-100).
   * Null when unavailable.
   */
  confidence: number | null;
}

export interface BookSegmentationResult {
  books: DetectedBook[];

  /**
   * OCR lines that could not be associated
   * with any book entry.
   */
  ignoredLines: string[];
}