/**
 * ============================================================
 * DeeglobalGH Educational Knowledge Platform
 * Knowledge Engine Shared Types
 * ============================================================
 */

/**
 * Generic rule used by all classifiers.
 */
export interface KnowledgeRule {
  nodeCode: string
  priority: number
  baseScore: number
  patterns: string[]
  aliases?: string[]
  exclude?: string[]
}

/**
 * The type of evidence discovered during classification.
 */
export type EvidenceType =
  | "subject"
  | "resource"
  | "publisher"
  | "curriculum"
  | "activity"
  | "language"
  | "level"

export interface Evidence {
  type: EvidenceType
  nodeCode: string
  matchedText: string
  score: number
  priority: number
  reason: string
}

/**
 * One classified educational dimension.
 */
export interface FingerprintDimension {
  nodeCode: string
  confidence: number
  evidence: Evidence[]
}

/**
 * The complete educational fingerprint for a product.
 */
export interface EducationalFingerprint {
  subject?: FingerprintDimension
  resource?: FingerprintDimension
  publisher?: FingerprintDimension
  curriculum?: FingerprintDimension
  activity?: FingerprintDimension
  language?: FingerprintDimension
  level?: FingerprintDimension

  totalConfidence: number
}

/**
 * Final classification returned by the Knowledge Engine.
 */
export interface ClassificationResult {
  fingerprint: EducationalFingerprint
  evidence: Evidence[]
  warnings: string[]
  requiresManualReview: boolean
}