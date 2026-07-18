import { buildEducationalFingerprint } from "../lib/ekb/matcher/fingerprint";
import { compareFingerprints } from "../lib/ekb/matcher/compare";
import { scoreFingerprintMatch } from "../lib/ekb/matcher/scorer";

const source =
  "Golden English Language Textbook Book 4";

const candidates = [
  "Golden English Language Book 4",
  "Golden Mathematics Book 4",
  "Best Brain English Language Book 4",
  "Golden English Language Workbook Book 4",
];

const sourceFingerprint =
  buildEducationalFingerprint(source);

console.log("\nSOURCE");
console.log(source);
console.log(sourceFingerprint);

for (const candidate of candidates) {
  const candidateFingerprint =
    buildEducationalFingerprint(candidate);

  const comparison = compareFingerprints(
    sourceFingerprint,
    candidateFingerprint,
  );

  const result = scoreFingerprintMatch(comparison);

  console.log("\n--------------------------------");
  console.log(candidate);
  console.log(result);
}