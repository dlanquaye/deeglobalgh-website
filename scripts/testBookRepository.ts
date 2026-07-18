import { BookRepository } from "../lib/ekb/catalogue/bookRepository";

const tests = [
  "Golden English Language Textbook Book 4",
  "Golden Mathematics Book 5",
  "Best Brain English Book 2",
  "Interactive English Teacher Guide Basic 3",
  "Practical Mathematics Workbook Book 6",
];

for (const test of tests) {
  console.log("\n========================================");
  console.log(test);

  const best =
    BookRepository.findBestMatch(test);

  console.dir(best, {
    depth: null,
  });
}