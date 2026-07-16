import { abbreviationMap } from "./abbreviations";
import { typoCorrectionMap } from "./typoCorrections";

export const Knowledge = {
  abbreviations: abbreviationMap,
  typoCorrections: typoCorrectionMap,
} as const;