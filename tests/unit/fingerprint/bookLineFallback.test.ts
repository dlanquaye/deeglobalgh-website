import { describe, expect, it } from "vitest";

import { buildEducationalFingerprint } from "@/lib/ekb/matcher/fingerprint";

describe("Book Line Fallback", () => {
  it("should infer publisher from Golden English book line", () => {
    const fingerprint = buildEducationalFingerprint(
      "Golden English Language Book 4 Learner Book",
    );

    expect(fingerprint.publisherCode).toBe(
      "PUB_NEW_GOLDEN",
    );

    expect(fingerprint.bookLineCode).toBe(
      "BOOKLINE_GOLDEN_ENGLISH",
    );
  });

  it("should infer publisher from Golden Mathematics book line", () => {
    const fingerprint = buildEducationalFingerprint(
      "Golden Mathematics Book 5 Learner Book",
    );

    expect(fingerprint.publisherCode).toBe(
      "PUB_NEW_GOLDEN",
    );

    expect(fingerprint.bookLineCode).toBe(
      "BOOKLINE_GOLDEN_MATHEMATICS",
    );
  });

  it("should infer resource type from Best Brain metadata", () => {
    const fingerprint = buildEducationalFingerprint(
      "Best Brain Science Book 3",
    );

    expect(fingerprint.resourceTypeCode).toBe(
      "RESOURCE_LEARNER_BOOK",
    );
  });
});