import { Knowledge } from "../knowledge";

export function normalizeTypos(input: string): string {
  let value = input;

  for (const [typo, correction] of Object.entries(Knowledge.typoCorrections)) {
    const regex = new RegExp(`\\b${typo}\\b`, "gi");
    value = value.replace(regex, correction);
  }

  return value;
}