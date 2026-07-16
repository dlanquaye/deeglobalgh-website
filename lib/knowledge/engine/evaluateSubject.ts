import { evaluateRules } from "./evaluateRules";
import { FingerprintDimension } from "./types";
import { subjectRules } from "../rules/subjectRules";

export function evaluateSubject(
  productName: string
): FingerprintDimension | null {
  return evaluateRules(
    productName,
    subjectRules,
    "subject"
  );
}