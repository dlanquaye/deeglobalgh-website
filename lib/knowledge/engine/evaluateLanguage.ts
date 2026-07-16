import { evaluateRules } from "./evaluateRules";
import { FingerprintDimension } from "./types";
import { languageRules } from "../rules/languageRules";

export function evaluateLanguage(
  productName: string
): FingerprintDimension | null {
  return evaluateRules(
    productName,
    languageRules,
    "language"
  );
}