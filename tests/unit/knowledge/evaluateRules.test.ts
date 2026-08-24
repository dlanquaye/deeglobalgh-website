import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateRules,
} from "@/lib/knowledge/engine/evaluateRules";

import {
  languageRules,
} from "@/lib/knowledge/rules/languageRules";

describe(
  "evaluateRules",
  () => {
    it(
      "does not match Ga inside Kindergarten",
      () => {
        const result =
          evaluateRules(
            "Kindergarten 2",
            languageRules,
            "language"
          );

        expect(result).toBeNull();
      }
    );

    it(
      "continues to classify Ga when Ga appears as a standalone language word",
      () => {
        const result =
          evaluateRules(
            "Ga Language",
            languageRules,
            "language"
          );

        expect(
          result?.nodeCode
        ).toBe(
          "LANG_GA"
        );
      }
    );
  }
);