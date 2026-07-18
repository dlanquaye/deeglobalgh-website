export function cleanSchoolList(
  lines: string[]
): string[] {
  return lines
    .map((line) => line.trim())

    // Remove empty lines
    .filter((line) => line.length > 2)

    // Remove numbering like "1." or "12."
    .map((line) =>
      line.replace(/^\d+\.\s*/, "")
    )

    // Remove obvious headings
    .filter(
      (line) =>
        !/^book list/i.test(line) &&
        !/^textbooks/i.test(line) &&
        !/^stationery/i.test(line)
    )

    // Remove author lines
    .filter(
      (line) =>
        !/^by[: ]/i.test(line)
    );
}