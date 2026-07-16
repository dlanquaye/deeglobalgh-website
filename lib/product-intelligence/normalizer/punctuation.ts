export function removePunctuation(input: string): string {
  return input.replace(/[^\p{L}\p{N}\s]+/gu, " ");
}