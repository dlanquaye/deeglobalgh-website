import { EducationalFingerprint, FingerprintDimension } from "./types";
import { classifiers } from "./classifiers";

export function buildEducationalFingerprint(
  productName: string
): EducationalFingerprint {
  const fingerprint: EducationalFingerprint = {
    totalConfidence: 0,
  };

  let confidenceTotal = 0;
  let matchedCount = 0;

  for (const classifier of classifiers) {
    const result = classifier.evaluate(productName);

    if (!result) {
      continue;
    }

    fingerprint[classifier.key] = result as FingerprintDimension;

    confidenceTotal += result.confidence;
    matchedCount++;
  }

  fingerprint.totalConfidence =
    matchedCount === 0
      ? 0
      : Math.round(confidenceTotal / matchedCount);

  return fingerprint;
}