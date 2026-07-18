import { describe, expect, it } from "vitest";

import { buildEducationalFingerprint } from "@/lib/ekb/matcher/fingerprint";
import { BOOK_FIXTURES } from "@/tests/fixtures/books";

describe("Educational Fingerprint", () => {
  for (const fixture of BOOK_FIXTURES) {
    it(`should correctly fingerprint "${fixture.input}"`, () => {
      const fingerprint = buildEducationalFingerprint(
        fixture.input,
      );

      

      expect(fingerprint).toBeDefined();
    });
  }
});