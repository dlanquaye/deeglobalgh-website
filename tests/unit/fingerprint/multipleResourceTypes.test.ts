import { describe, expect, it } from "vitest";

import { enrichEducationalFingerprint } from "@/lib/ekb/utils/enrichEducationalFingerprint";

describe("Multiple Resource Types", () => {
  it("should not guess a resource type when multiple are supported", () => {
    const result = enrichEducationalFingerprint({
      originalText: "",
      normalisedText: "",

      publisher: undefined,
      subject: undefined,
      level: undefined,
      resourceType: undefined,

      bookLine: {
        id: "1",
        code: "BOOKLINE_SAMPLE",
        name: "Sample Book Line",

        publisherCode: "PUB_SAMPLE",
        subjectCode: "SUB_SAMPLE",

        supportedResourceTypes: [
          "RESOURCE_LEARNER_BOOK",
          "RESOURCE_WORKBOOK",
        ],

        aliases: [],
        active: true,
      },

      fingerprint: {
        publisherCode: undefined,
        bookLineCode: "BOOKLINE_SAMPLE",
        subjectCode: undefined,
        levelCode: undefined,
        resourceTypeCode: undefined,
        curriculumCode: undefined,
        languageCode: undefined,
        confidence: 0,
      },
    });

    expect(result.fingerprint.resourceTypeCode).toBeUndefined();
  });
});