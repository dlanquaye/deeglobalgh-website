/**
 * Splits normalised text into searchable tokens.
 */
export function tokenizeText(text: string): string[] {
  return text
    .split(" ")
    .map(token => token.trim())
    .filter(Boolean)
}