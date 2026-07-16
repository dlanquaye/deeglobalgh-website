import { evaluatePublisher } from "../lib/knowledge/engine/evaluatePublisher";

const products = [
  "Golden English Language Textbook Book 4",
  "Best Brain Mathematics Workbook Book 5",
  "Don Science Textbook",
  "Wise Ant English Workbook",
  "Excellence Mathematics Textbook",
  "Aki-Ola Social Studies Book",
  "Essential Science Workbook",
  "Right Hour English Book",
  "Akrong Mathematics Book",
  "A+ English Language Book"
];

for (const product of products) {
  console.log(product);
  console.log(evaluatePublisher(product));
  console.log("================================");
}