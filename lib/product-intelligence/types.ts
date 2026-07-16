export enum MatchState {
  EXACT = "EXACT",
  HIGH_CONFIDENCE = "HIGH_CONFIDENCE",
  AMBIGUOUS = "AMBIGUOUS",
  NO_MATCH = "NO_MATCH",
}

export enum DecisionAction {
  AUTO_MATCH = "AUTO_MATCH",
  ASK_CLARIFICATION = "ASK_CLARIFICATION",
  ESCALATE_TO_HUMAN = "ESCALATE_TO_HUMAN",
  RECOMMEND_PRODUCTS = "RECOMMEND_PRODUCTS",
}

export enum MatchMethod {
  EXACT = "EXACT",
  ALIAS = "ALIAS",
  CONCEPT = "CONCEPT",
  FUZZY = "FUZZY",
  AI = "AI",
}

export interface MatchCandidate {
  productId: string;

  confidence: number;

  method: MatchMethod;

  matchedText: string;
}

export interface MatchResult {
  state: MatchState;

  action: DecisionAction;

  candidates: MatchCandidate[];
}