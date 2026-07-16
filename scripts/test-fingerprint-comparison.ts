import { buildEducationalFingerprint } from "../lib/knowledge/engine/buildEducationalFingerprint";
import { compareFingerprints } from "../lib/knowledge/engine/compareFingerprints";

const comparisons = [
  [
    "Golden English Language Textbook Book 4",
    "Best Brain English Language Textbook Book 4",
  ],

  [
    "Golden English Language Textbook Book 4",
    "Golden English Language Workbook Book 4",
  ],

  [
    "Golden English Language Textbook Book 4",
    "Golden Mathematics Textbook Book 4",
  ],

  [
    "Golden English Language Textbook Book 4",
    "Golden English Language Textbook Book 5",
  ],
];

console.log("\n=== FINGERPRINT COMPARISON TEST ===\n");

for (const [leftName, rightName] of comparisons) {
  console.log("==================================================");
  console.log("Product A:", leftName);
  console.log("Product B:", rightName);

  const leftFingerprint = buildEducationalFingerprint(leftName);
  const rightFingerprint = buildEducationalFingerprint(rightName);

  const comparison = compareFingerprints(
    leftFingerprint,
    rightFingerprint
  );

  console.log("\nSimilarity");
  console.log(comparison.similarity + "%");

  console.log("\nMatching Dimensions");
  console.log(comparison.matchingDimensions);

  console.log("\nDifferent Dimensions");
  console.log(comparison.differentDimensions);

  console.log("\nMissing Dimensions");
  console.log(comparison.missingDimensions);

  console.log("==================================================\n");
}