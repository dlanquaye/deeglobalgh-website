import { parseEducationalText } from "../lib/ekb/utils/parseEducationalText";

const samples = [
  "Golden English Language Textbook Book 4",
  "Best Brain Mathematics Book 6",
  "Practical Mathematics Workbook Basic 5",
  "Interactive English Language Teacher Guide Basic 2",
  "York Series Science for Primary Schools Book 3",
];

for (const sample of samples) {
  console.log("\n========================================");
  console.log(sample);
  console.log(
    JSON.stringify(parseEducationalText(sample), null, 2),
  );
}