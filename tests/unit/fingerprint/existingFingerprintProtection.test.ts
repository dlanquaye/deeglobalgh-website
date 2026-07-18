import { describe, expect, it } from "vitest";

import { enrichEducationalFingerprint } from "@/lib/ekb/utils/enrichEducationalFingerprint";

describe("Existing Fingerprint Protection", () => {
  it("should not overwrite existing fingerprint values", () => {
    const result = enrichEducationalFingerprint({
      originalText: "",
      normalisedText: "",

      publisher: undefined,
      subject: undefined,
      level: undefined,
      resourceType: undefined,

      bookLine: {
        id: "1",
        code: "BOOKLINE_GOLDEN_ENGLISH",
        name: "Golden English",

        publisherCode: "PUB_NEW_GOLDEN",
        subjectCode: "SUB_ENGLISH",
        curriculumCode: "CURRICULUM_NACCA",
        languageCode: "LANGUAGE_ENGLISH",

        supportedResourceTypes: [
          "RESOURCE_LEARNER_BOOK",
        ],

        aliases: [],
        active: true,
      },

      fingerprint: {
        publisherCode: "PUB_EXISTING",
        bookLineCode: "BOOKLINE_GOLDEN_ENGLISH",
        subjectCode: "SUB_EXISTING",
        levelCode: undefined,
        resourceTypeCode: "RESOURCE_EXISTING",
        curriculumCode: "CURRICULUM_EXISTING",
        languageCode: "LANGUAGE_EXISTING",
        confidence: 100,
      },
    });

    expect(result.fingerprint.publisherCode).toBe(
      "PUB_EXISTING",
    );

    expect(result.fingerprint.subjectCode).toBe(
      "SUB_EXISTING",
    );

    expect(result.fingerprint.curriculumCode).toBe(
      "CURRICULUM_EXISTING",
    );

    expect(result.fingerprint.languageCode).toBe(
      "LANGUAGE_EXISTING",
    );

    expect(result.fingerprint.resourceTypeCode).toBe(
      "RESOURCE_EXISTING",
    );
  });
});