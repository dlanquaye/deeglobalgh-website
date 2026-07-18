import { describe, expect, it } from "vitest";

import { enrichEducationalFingerprint } from "@/lib/ekb/utils/enrichEducationalFingerprint";

describe("Curriculum & Language Fallback", () => {
  it("should enrich curriculum and language from book line", () => {
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
        curriculumCode: "CURRICULUM_NACCA",
        languageCode: "LANGUAGE_ENGLISH",

        supportedLevels: [],
        supportedResourceTypes: [],

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

    expect(result.fingerprint.curriculumCode).toBe(
      "CURRICULUM_NACCA",
    );

    expect(result.fingerprint.languageCode).toBe(
      "LANGUAGE_ENGLISH",
    );
  });
});