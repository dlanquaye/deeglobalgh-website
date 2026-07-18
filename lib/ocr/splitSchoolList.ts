export function splitSchoolList(
  text: string
): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const books: string[] = [];
  let currentBook = "";

  for (const line of lines) {
    // Ignore document heading
    if (/^book\s*list/i.test(line)) {
      continue;
    }

    // Ignore page separators
    if (/^-+$/.test(line)) {
      continue;
    }

    // New numbered book
    if (/^\d+[.)]?\s*/.test(line)) {
      if (currentBook.length > 0) {
        books.push(currentBook.trim());
      }

      currentBook = line.replace(/^\d+[.)]?\s*/, "");

      continue;
    }

    // Ignore author lines for now
    if (/^by\s*:/i.test(line)) {
      continue;
    }

    // Continue building the current book
    if (currentBook.length > 0) {
      currentBook += " " + line;
    }
  }

  if (currentBook.length > 0) {
    books.push(currentBook.trim());
  }

  return books;
}