import { buildEducationalFingerprint } from "../lib/ekb/matcher/fingerprint";
import { compareFingerprints } from "../lib/ekb/matcher/compare";

const productA =
  "Golden English Language Textbook Book 4";

const productB =
  "Golden English Language Book 4";

const fpA = buildEducationalFingerprint(productA);
const fpB = buildEducationalFingerprint(productB);

console.log("Fingerprint A");
console.log(fpA);

console.log();

console.log("Fingerprint B");
console.log(fpB);

console.log();

console.log(compareFingerprints(fpA, fpB));