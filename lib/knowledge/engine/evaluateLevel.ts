import {
  evaluateRules,
} from "./evaluateRules";

import {
  FingerprintDimension,
} from "./types";

import {
  levelRules,
} from "../rules/levelRules";

export function evaluateLevel(
  productName: string,
): FingerprintDimension | null {
  return evaluateRules(
    productName,
    levelRules,
    "level",
  );
}