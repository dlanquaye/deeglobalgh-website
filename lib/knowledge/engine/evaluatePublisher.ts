import { FingerprintDimension } from "./types";
import { evaluateRules } from "./evaluateRules";
import { publisherRules } from "../rules/publisherRules";

export function evaluatePublisher(
  productName: string
): FingerprintDimension | null {
  return evaluateRules(
    productName,
    publisherRules,
    "publisher"
  );
}