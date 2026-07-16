import { evaluateActivity } from "../lib/knowledge/engine/evaluateActivity";

const tests = [
  "Golden English Reading Book",
  "Golden English Writing Book",
  "Golden English Trace and Write",
  "Golden English Colouring Book",
  "Golden BECE Revision Guide",
  "Golden Mathematics Practice Book",
  "Golden Science Assessment Book",
  "Golden English Exercise Book",
  "Golden English Listening Skills",
  "Golden English Speaking Skills",
];

console.log("\n=== ACTIVITY CLASSIFIER TEST ===\n");

for (const product of tests) {
  console.log(product);
  console.dir(evaluateActivity(product), { depth: null });
  console.log("--------------------------------");
}