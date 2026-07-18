export enum MatchStatus {
  MATCHED = "MATCHED",
  REVIEW = "REVIEW",
  UNMATCHED = "UNMATCHED",
}

export interface ProductBookMatch {
  productId: string;

  bookId: string | null;

  confidence: number;

  status: MatchStatus;

  reason: string;
}