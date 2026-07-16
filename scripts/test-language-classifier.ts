import { evaluateLanguage } from "../lib/knowledge/engine/evaluateLanguage";

const tests = [
  "Golden English Language Textbook",
  "Golden French Textbook",
  "Golden Twi Reader",
  "Golden Ga Reader",
  "Golden Ewe Workbook",
];

console.log("\n=== LANGUAGE CLASSIFIER TEST ===\n");

for (const product of tests) {
  console.log(product);
  console.dir(evaluateLanguage(product), { depth: null });
  console.log("--------------------------------");
}