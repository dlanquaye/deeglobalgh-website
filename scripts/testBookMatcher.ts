import { findCandidateBooks } from "../lib/product-intelligence/matcher/bookMatcher";

async function main() {
  const books = await findCandidateBooks();

  console.log(`Books in EKB: ${books.length}`);

  console.dir(books.slice(0, 5), {
    depth: null,
  });
}

main();