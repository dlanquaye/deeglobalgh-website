import { evaluateRules } from "./evaluateRules";
import { FingerprintDimension } from "./types";
import { activityRules } from "../rules/activityRules";

export function evaluateActivity(
  productName: string
): FingerprintDimension | null {
  return evaluateRules(
    productName,
    activityRules,
    "activity"
  );
}