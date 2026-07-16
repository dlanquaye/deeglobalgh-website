import { Knowledge } from "../knowledge";

export function normalizeAbbreviations(input: string): string {
  let value = input;

  for (const [abbreviation, fullText] of Object.entries(Knowledge.abbreviations)) {
    const regex = new RegExp(`\\b${abbreviation}\\b`, "gi");
    value = value.replace(regex, fullText);
  }

  return value;
}