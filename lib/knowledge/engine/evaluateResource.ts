import { evaluateRules } from "./evaluateRules";
import { FingerprintDimension } from "./types";
import { resourceRules } from "../rules/resourceRules";

export function evaluateResource(
  productName: string
): FingerprintDimension | null {
  return evaluateRules(
    productName,
    resourceRules,
    "resource"
  );
}