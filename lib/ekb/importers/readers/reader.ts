import { NaccaBookRecord } from "../types";

export interface ImportReader {
  /**
   * Reads the source and returns standardised
   * educational records.
   */
  read(): Promise<NaccaBookRecord[]>;
}