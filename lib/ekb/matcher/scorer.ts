import { FingerprintComparison } from "./compare";

export enum MatchStrength {
  EXACT = "EXACT",
  VERY_HIGH = "VERY_HIGH",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  NONE = "NONE",
}

export interface MatchResult extends FingerprintComparison {
  strength: MatchStrength;
}

export function scoreFingerprintMatch(
  comparison: FingerprintComparison,
): MatchResult {
  let strength = MatchStrength.NONE;

  if (comparison.score >= 95) {
    strength = MatchStrength.EXACT;
  } else if (comparison.score >= 85) {
    strength = MatchStrength.VERY_HIGH;
  } else if (comparison.score >= 70) {
    strength = MatchStrength.HIGH;
  } else if (comparison.score >= 50) {
    strength = MatchStrength.MEDIUM;
  } else if (comparison.score > 0) {
    strength = MatchStrength.LOW;
  }

  return {
    ...comparison,
    strength,
  };
}