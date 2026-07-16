import { buildEducationalFingerprint } from "../lib/knowledge/engine/buildEducationalFingerprint";

const products = [
  "Golden English Language Textbook Book 4",
  "Best Brain Mathematics Workbook Book 5",
  "Golden BECE Revision Guide",
  "Aki-Ola Social Studies Book 6",
  "Golden SHS Physics"
];

for (const product of products) {
  console.log("================================");
  console.log(product);
  console.dir(buildEducationalFingerprint(product), {
    depth: null,
    colors: true,
  });
}