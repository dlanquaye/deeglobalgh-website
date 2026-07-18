import { describe, expect, it } from "vitest";

import { enrichEducationalFingerprint } from "@/lib/ekb/utils/enrichEducationalFingerprint";

describe("Resource Type Fallback", () => {
  it("should infer resource type when only one supported resource exists", () => {
    const result = enrichEducationalFingerprint({
      originalText: "",
      normalisedText: "",

      publisher: undefined,
      subject: undefined,
      level: undefined,
      resourceType: undefined,

      bookLine: {
        id: "1",
        code: "BOOKLINE_BEST_BRAIN_SCIENCE",
        name: "Best Brain Science",

        publisherCode: "PUB_BEST_BRAIN",
        subjectCode: "SUB_SCIENCE",

        supportedResourceTypes: [
          "RESOURCE_LEARNER_BOOK",
        ],

        aliases: [],
        active: true,
      },

      fingerprint: {
        publisherCode: undefined,
        bookLineCode: "BOOKLINE_BEST_BRAIN_SCIENCE",
        subjectCode: undefined,
        levelCode: undefined,
        resourceTypeCode: undefined,
        curriculumCode: undefined,
        languageCode: undefined,
        confidence: 0,
      },
    });

    expect(result.fingerprint.resourceTypeCode).toBe(
      "RESOURCE_LEARNER_BOOK",
    );
  });
});