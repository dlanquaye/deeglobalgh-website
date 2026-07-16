import { FingerprintDimension } from "./types";
import { evaluateRules } from "./evaluateRules";
import { curriculumRules } from "../rules/curriculumRules";

export function evaluateCurriculum(
  productName: string
): FingerprintDimension | null {
  return evaluateRules(
    productName,
    curriculumRules,
    "curriculum"
  );
}