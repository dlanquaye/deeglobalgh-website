import { evaluateResource } from "../lib/knowledge/engine/evaluateResource";

const tests = [
  "Golden English Textbook Book 4",
  "Golden English Workbook Book 4",
  "Golden English Activity Book",
  "Golden English Practice Book",
  "Golden English Exercise Book",
  "Golden English Assessment Book",
  "Golden English Revision Guide",
  "Golden English Revision Questions",
  "Golden English Teacher Guide",
  "Oxford School Dictionary",
  "Oxford School Atlas",
  "African Story Book",
  "Primary English Reader",
  "Alphabet Flash Cards",
  "Handwriting Book 1",
  "Colouring Book 1",
  "Copy Writing Book 1",
];

console.log("\n=== RESOURCE CLASSIFIER TEST ===\n");

for (const product of tests) {
  console.log(product);
  console.dir(evaluateResource(product), { depth: null });
  console.log("--------------------------------");
}