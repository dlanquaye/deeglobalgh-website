import { normaliseText } from "./normaliseText";

import {
  Evidence,
  EvidenceType,
  FingerprintDimension,
  KnowledgeRule,
} from "./types";

function escapeRegExp(
  value: string
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function matchesPattern(
  normalisedText: string,
  pattern: string
): boolean {
  const normalisedPattern =
    normaliseText(pattern);

  if (!normalisedPattern) {
    return false;
  }

  /*
   * Very short single-word patterns must be matched
   * as complete words.
   *
   * Without this protection:
   *
   *   "ga"
   *
   * incorrectly matches:
   *
   *   "kindergarten"
   *
   * Longer words and phrases keep the existing
   * substring behaviour so we do not unexpectedly
   * change the wider educational-rule engine.
   */
  const isShortSingleWord =
    !normalisedPattern.includes(" ") &&
    normalisedPattern.length <= 3;

  if (!isShortSingleWord) {
    return normalisedText.includes(
      normalisedPattern
    );
  }

  const expression =
    new RegExp(
      `(?:^|\\s)${escapeRegExp(
        normalisedPattern
      )}(?=\\s|$)`,
      "i"
    );

  return expression.test(
    normalisedText
  );
}

export function evaluateRules(
  productName: string,
  rules: KnowledgeRule[],
  evidenceType: EvidenceType
): FingerprintDimension | null {
  const normalised =
    normaliseText(productName);

  let winningRule:
    KnowledgeRule | null = null;

  let winningPattern:
    string | null = null;

  for (const rule of rules) {
    // Skip rules excluded by matching phrases
    if (
      rule.exclude?.some(
        (phrase) =>
          matchesPattern(
            normalised,
            phrase
          )
      )
    ) {
      continue;
    }

    // Match against primary patterns
    const matchedPattern =
      rule.patterns.find(
        (pattern) =>
          matchesPattern(
            normalised,
            pattern
          )
      );

    if (!matchedPattern) {
      continue;
    }

    // Select highest priority.
    // If priorities tie, prefer highest base score.
    if (
      !winningRule ||
      rule.priority >
        winningRule.priority ||
      (
        rule.priority ===
          winningRule.priority &&
        rule.baseScore >
          winningRule.baseScore
      )
    ) {
      winningRule =
        rule;

      winningPattern =
        matchedPattern;
    }
  }

  if (
    !winningRule ||
    !winningPattern
  ) {
    return null;
  }

  const evidence:
    Evidence = {
      type:
        evidenceType,

      nodeCode:
        winningRule.nodeCode,

      matchedText:
        winningPattern,

      score:
        winningRule.baseScore,

      priority:
        winningRule.priority,

      reason:
        `Matched pattern "${winningPattern}"`,
    };

  return {
    nodeCode:
      winningRule.nodeCode,

    confidence:
      winningRule.baseScore,

    evidence: [
      evidence,
    ],
  };
}