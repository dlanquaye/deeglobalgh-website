import { describe, expect, it } from "vitest";

import { enrichEducationalFingerprint } from "@/lib/ekb/utils/enrichEducationalFingerprint";

describe("Educational Fingerprint Enrichment", () => {
  it("should enrich publisher and subject codes from book line", () => {
    const result = enrichEducationalFingerprint({
      originalText: "",
      normalisedText: "",

      publisher: undefined,

      bookLine: {
        id: "1",
        code: "BOOKLINE_GOLDEN_ENGLISH",
        name: "Golden English",

        publisherCode: "PUB_NEW_GOLDEN",
        subjectCode: "SUB_ENGLISH",

        aliases: [],
        active: true,
      },

      subject: undefined,
      level: undefined,
      resourceType: undefined,

      fingerprint: {
        publisherCode: undefined,
        bookLineCode: "BOOKLINE_GOLDEN_ENGLISH",
        subjectCode: undefined,
        levelCode: undefined,
        resourceTypeCode: undefined,
        curriculumCode: undefined,
        languageCode: undefined,
        confidence: 0,
      },
    });

    expect(result.fingerprint.publisherCode).toBe(
      "PUB_NEW_GOLDEN",
    );

    expect(result.fingerprint.subjectCode).toBe(
      "SUB_ENGLISH",
    );
  });
});