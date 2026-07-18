import { MatchStatus } from "./types";

export function determineMatchStatus(
  confidence: number,
): MatchStatus {
  if (confidence >= 95) {
    return MatchStatus.MATCHED;
  }

  if (confidence >= 75) {
    return MatchStatus.REVIEW;
  }

  return MatchStatus.UNMATCHED;
}