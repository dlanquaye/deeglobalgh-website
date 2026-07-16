import { evaluateCurriculum } from "../lib/knowledge/engine/evaluateCurriculum";

const products = [
  "Golden English Language Textbook Book 4",
  "Best Brain Mathematics Workbook Book 5",
  "Golden Science Basic 6",
  "Golden BECE Revision Guide",
  "Golden WASSCE Mathematics",
  "Golden SHS Physics",
  "Golden JHS English",
  "KG English Activity Book",
  "Nursery Mathematics Workbook",
  "Pre-School Colouring Book"
];

for (const product of products) {
  console.log(product);
  console.log(evaluateCurriculum(product));
  console.log("================================");
}