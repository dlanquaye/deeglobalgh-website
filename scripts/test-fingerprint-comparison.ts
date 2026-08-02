import { buildEducationalFingerprint } from "../lib/knowledge/engine/buildEducationalFingerprint";
import { compareFingerprints } from "../lib/knowledge/engine/compareFingerprints";

interface ComparisonCase {
  label: string;
  leftName: string;
  rightName: string;
  expectedLeftLevel: string;
  expectedRightLevel: string;
  expectedLevelResult: "matching" | "different";
}

const comparisons: ComparisonCase[] = [
  {
    label: "Different publishers, same educational level",
    leftName: "Golden English Language Textbook Book 4",
    rightName: "Best Brain English Language Textbook Book 4",
    expectedLeftLevel: "LEVEL_B4",
    expectedRightLevel: "LEVEL_B4",
    expectedLevelResult: "matching",
  },
  {
    label: "Different resource types, same educational level",
    leftName: "Golden English Language Textbook Book 4",
    rightName: "Golden English Language Workbook Book 4",
    expectedLeftLevel: "LEVEL_B4",
    expectedRightLevel: "LEVEL_B4",
    expectedLevelResult: "matching",
  },
  {
    label: "Different subjects, same educational level",
    leftName: "Golden English Language Textbook Book 4",
    rightName: "Golden Mathematics Textbook Book 4",
    expectedLeftLevel: "LEVEL_B4",
    expectedRightLevel: "LEVEL_B4",
    expectedLevelResult: "matching",
  },
  {
    label: "Same book details, different educational levels",
    leftName: "Golden English Language Textbook Book 4",
    rightName: "Golden English Language Textbook Book 5",
    expectedLeftLevel: "LEVEL_B4",
    expectedRightLevel: "LEVEL_B5",
    expectedLevelResult: "different",
  },
  {
    label: "Basic and primary aliases represent the same level",
    leftName: "Golden English Language Textbook Basic 4",
    rightName: "Golden English Language Textbook P4",
    expectedLeftLevel: "LEVEL_B4",
    expectedRightLevel: "LEVEL_B4",
    expectedLevelResult: "matching",
  },
  {
    label: "JHS description overrides generic book number",
    leftName: "Golden English Language Textbook JHS 1 Book 1",
    rightName: "Golden English Language Textbook Basic 1",
    expectedLeftLevel: "LEVEL_B7",
    expectedRightLevel: "LEVEL_B1",
    expectedLevelResult: "different",
  },
  {
    label: "SHS description overrides generic book number",
    leftName: "Golden English Language Textbook SHS 2 Book 2",
    rightName: "Golden English Language Textbook Basic 2",
    expectedLeftLevel: "LEVEL_SHS2",
    expectedRightLevel: "LEVEL_B2",
    expectedLevelResult: "different",
  },
];

console.log("\n=== FINGERPRINT COMPARISON TEST ===\n");

for (const comparisonCase of comparisons) {
  const {
    label,
    leftName,
    rightName,
    expectedLeftLevel,
    expectedRightLevel,
    expectedLevelResult,
  } = comparisonCase;

  console.log("==================================================");
  console.log("Test:", label);
  console.log("Product A:", leftName);
  console.log("Product B:", rightName);

  const leftFingerprint = buildEducationalFingerprint(leftName);
  const rightFingerprint = buildEducationalFingerprint(rightName);

  const comparison = compareFingerprints(
    leftFingerprint,
    rightFingerprint,
  );

  const leftLevel = leftFingerprint.level?.nodeCode;
  const rightLevel = rightFingerprint.level?.nodeCode;

  console.log("\nDetected Levels");
  console.log("Product A:", leftLevel);
  console.log("Product B:", rightLevel);

  console.log("\nSimilarity");
  console.log(comparison.similarity + "%");

  console.log("\nMatching Dimensions");
  console.log(comparison.matchingDimensions);

  console.log("\nDifferent Dimensions");
  console.log(comparison.differentDimensions);

  console.log("\nMissing Dimensions");
  console.log(comparison.missingDimensions);

  if (leftLevel !== expectedLeftLevel) {
    throw new Error(
      `${label}: expected Product A level ${expectedLeftLevel}, received ${leftLevel ?? "undefined"}`,
    );
  }

  if (rightLevel !== expectedRightLevel) {
    throw new Error(
      `${label}: expected Product B level ${expectedRightLevel}, received ${rightLevel ?? "undefined"}`,
    );
  }

  const levelResultDimensions =
    expectedLevelResult === "matching"
      ? comparison.matchingDimensions
      : comparison.differentDimensions;

  if (!levelResultDimensions.includes("level")) {
    throw new Error(
      `${label}: expected level to appear in ${expectedLevelResult} dimensions`,
    );
  }

  console.log("\nResult: PASS");
  console.log("==================================================\n");
}

console.log("All fingerprint comparison tests passed.\n");