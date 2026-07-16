import { normaliseText } from "./normaliseText";
import {
  Evidence,
  EvidenceType,
  FingerprintDimension,
  KnowledgeRule,
} from "./types";

export function evaluateRules(
  productName: string,
  rules: KnowledgeRule[],
  evidenceType: EvidenceType
): FingerprintDimension | null {
  const normalised = normaliseText(productName);

  let winningRule: KnowledgeRule | null = null;
  let winningPattern: string | null = null;

  for (const rule of rules) {
    // Skip rules excluded by matching phrases
    if (
      rule.exclude?.some((phrase) =>
        normalised.includes(normaliseText(phrase))
      )
    ) {
      continue;
    }

    // Match against primary patterns
    const matchedPattern = rule.patterns.find((pattern) =>
      normalised.includes(normaliseText(pattern))
    );

    if (!matchedPattern) {
      continue;
    }

    // Select highest priority.
    // If priorities tie, prefer highest base score.
    if (
      !winningRule ||
      rule.priority > winningRule.priority ||
      (rule.priority === winningRule.priority &&
        rule.baseScore > winningRule.baseScore)
    ) {
      winningRule = rule;
      winningPattern = matchedPattern;
    }
  }

  if (!winningRule || !winningPattern) {
    return null;
  }

  const evidence: Evidence = {
  type: evidenceType,
  nodeCode: winningRule.nodeCode,
  matchedText: winningPattern,
  score: winningRule.baseScore,
  priority: winningRule.priority,
  reason: `Matched pattern "${winningPattern}"`,
};

  return {
    nodeCode: winningRule.nodeCode,
    confidence: winningRule.baseScore,
    evidence: [evidence],
  };
}