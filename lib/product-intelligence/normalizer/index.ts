import { trim } from "./trim";
import { lowercase } from "./lowercase";
import { removeExtraSpaces } from "./spaces";
import { removePunctuation } from "./punctuation";
import { normalizeNumbers } from "./numbers";
import { normalizeAbbreviations } from "./abbreviations";
import { normalizeTypos } from "./typos";

export function normalizeText(input: string): string {
  let value = trim(input);

value = removeExtraSpaces(value);
value = removePunctuation(value);
value = removeExtraSpaces(value);
value = lowercase(value);
value = normalizeNumbers(value);
value = normalizeAbbreviations(value);
value = normalizeTypos(value);

return value;

  
}