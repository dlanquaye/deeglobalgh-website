import { EducationalFingerprint } from "../types";
import { parseEducationalText } from "../utils/parseEducationalText";

/**
 * ============================================================
 * Educational Knowledge Base (EKB)
 * Fingerprint V2
 * ============================================================
 *
 * Converts any educational text into a canonical fingerprint.
 */

export function buildEducationalFingerprint(
  text: string,
): EducationalFingerprint {
  return parseEducationalText(text).fingerprint;
}