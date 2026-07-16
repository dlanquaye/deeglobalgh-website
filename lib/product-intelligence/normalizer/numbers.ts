export function normalizeNumbers(input: string): string {
  return input
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, "$1");
}