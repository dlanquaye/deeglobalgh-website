import { ReferenceMatchMethod } from "./types";

export interface ReferenceResult {
  /**
   * Canonical database identifier.
   */
  id?: string;

  /**
   * Canonical code.
   * Example:
   * SUB_ENGLISH
   * LEVEL_B4
   */
  code?: string;

  /**
   * Official reference name.
   */
  name?: string;

  /**
   * Original text received from OCR/parser.
   */
  matchedText: string;

  /**
   * Resolution confidence.
   */
  confidence: number;

  /**
   * How the match occurred.
   */
  method: ReferenceMatchMethod;

  /**
   * Whether a reference was successfully resolved.
   */
  matched: boolean;
}