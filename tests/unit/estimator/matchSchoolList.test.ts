import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  EducationalProductMatchCoordinator,
} from "@/lib/estimator/EducationalProductMatchCoordinator";

import {
  matchSchoolList,
} from "@/lib/ocr/matchSchoolList";

describe(
  "matchSchoolList publisher safety",
  () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it(
      "rejects a high-scoring candidate when Best Brain is requested but candidate publisher evidence is missing",
      async () => {
        vi.spyOn(
          EducationalProductMatchCoordinator.prototype,
          "findBestMatches"
        ).mockResolvedValue([
          {
            product: {
              id: "product-language-literacy",
              sku: "TEST-001",
              productName:
                "Language and Literacy Skills for Kindergarten - KG 1",
              retailPrice: 50,
              stockQty: 10,
            },

            similarity: 83,
            legacySimilarity: 83,
            educationalBookScore: 0,

            matchingDimensions: [
              "subject",
              "level",
            ],

            differentDimensions: [],

            missingDimensions: [
              "publisher",
            ],

            evidenceSources: [
              "LEGACY_FINGERPRINT",
            ],
          },
        ]);

        const result =
          await matchSchoolList([
            "Phonics - Best Brain (KG1)",
          ]);

        expect(result).toEqual([
          {
            originalLine:
              "Phonics - Best Brain (KG1)",

            similarity: 0,
          },
        ]);
      }
    );

    it(
      "rejects a high-scoring candidate when Masterman is requested but candidate publisher evidence is missing",
      async () => {
        vi.spyOn(
          EducationalProductMatchCoordinator.prototype,
          "findBestMatches"
        ).mockResolvedValue([
          {
            product: {
              id: "product-creative-arts",
              sku: "TEST-002",
              productName:
                "Creative Arts for Kindergarten - KG 1",
              retailPrice: 50,
              stockQty: 10,
            },

            similarity: 91,
            legacySimilarity: 91,
            educationalBookScore: 0,

            matchingDimensions: [
              "subject",
              "level",
            ],

            differentDimensions: [],

            missingDimensions: [
              "publisher",
            ],

            evidenceSources: [
              "LEGACY_FINGERPRINT",
            ],
          },
        ]);

        const result =
          await matchSchoolList([
            "Creativity Masterman Arts (KG1)",
          ]);

        expect(result).toEqual([
          {
            originalLine:
              "Creativity Masterman Arts (KG1)",

            similarity: 0,
          },
        ]);
      }
    );

    it(
      "rejects a high-scoring candidate when Active Kids publisher evidence is missing",
      async () => {
        vi.spyOn(
          EducationalProductMatchCoordinator.prototype,
          "findBestMatches"
        ).mockResolvedValue([
          {
            product: {
              id: "product-generic-maths",
              sku: "TEST-003",
              productName:
                "Maths and Beyond Maths for Kindergarten - KG 1",
              retailPrice: 50,
              stockQty: 10,
            },

            similarity: 91,
            legacySimilarity: 91,
            educationalBookScore: 0,

            matchingDimensions: [
              "subject",
              "level",
            ],

            differentDimensions: [],

            missingDimensions: [
              "publisher",
            ],

            evidenceSources: [
              "LEGACY_FINGERPRINT",
            ],
          },
        ]);

        const result =
          await matchSchoolList([
            "Numeracy KG1 Active Kids",
          ]);

        expect(result).toEqual([
          {
            originalLine:
              "Numeracy KG1 Active Kids",

            similarity: 0,
          },
        ]);
      }
    );

    it(
      "continues to accept a safe high-scoring match when no blocking identity is missing",
      async () => {
        vi.spyOn(
          EducationalProductMatchCoordinator.prototype,
          "findBestMatches"
        ).mockResolvedValue([
          {
            product: {
              id: "product-best-brain",
              sku: "TEST-004",
              productName:
                "Best Brain Phonics for Kindergarten - KG 1",
              retailPrice: 50,
              stockQty: 10,
            },

            similarity: 95,
            legacySimilarity: 95,
            educationalBookScore: 0,

            matchingDimensions: [
              "subject",
              "level",
              "publisher",
            ],

            differentDimensions: [],

            missingDimensions: [],

            evidenceSources: [
              "LEGACY_FINGERPRINT",
            ],
          },
        ]);

        const result =
          await matchSchoolList([
            "Phonics - Best Brain (KG1)",
          ]);

        expect(result).toEqual([
          {
            originalLine:
              "Phonics - Best Brain (KG1)",

            matchedProductId:
              "product-best-brain",

            matchedProductName:
              "Best Brain Phonics for Kindergarten - KG 1",

            similarity:
              95,
          },
        ]);
      }
    );

    it(
      "uses KG1 document context for matching while preserving the original school-list line",
      async () => {
        const findBestMatchesSpy =
          vi.spyOn(
            EducationalProductMatchCoordinator.prototype,
            "findBestMatches"
          ).mockResolvedValue([]);

        const result =
          await matchSchoolList(
            [
              "OWOP Golden Series",
            ],
            "KG1"
          );

        expect(
          findBestMatchesSpy
        ).toHaveBeenCalledWith(
          "OWOP Golden Series KG1",
          25
        );

        expect(result).toEqual([
          {
            originalLine:
              "OWOP Golden Series",

            similarity: 0,
          },
        ]);
      }
    );

    it(
      "does not override an OCR-misspelled Kindergarten 2 level with KG1 document context",
      async () => {
        const findBestMatchesSpy =
          vi.spyOn(
            EducationalProductMatchCoordinator.prototype,
            "findBestMatches"
          ).mockResolvedValue([]);

        const result =
          await matchSchoolList(
            [
              "Unique Field Kindertgen 2 Comprehension",
            ],
            "KG1"
          );

        expect(
          findBestMatchesSpy
        ).toHaveBeenCalledWith(
          "Unique Field Kindertgen 2 Comprehension",
          25
        );

        expect(result).toEqual([
          {
            originalLine:
              "Unique Field Kindertgen 2 Comprehension",

            similarity: 0,
          },
        ]);
      }
    );

    it(
      "does not override an explicit KG2 level with KG1 document context",
      async () => {
        const findBestMatchesSpy =
          vi.spyOn(
            EducationalProductMatchCoordinator.prototype,
            "findBestMatches"
          ).mockResolvedValue([]);

        const result =
          await matchSchoolList(
            [
              "Unique Field Kindergarten 2 Comprehension",
            ],
            "KG1"
          );

        expect(
          findBestMatchesSpy
        ).toHaveBeenCalledWith(
          "Unique Field Kindergarten 2 Comprehension",
          25
        );

        expect(result).toEqual([
          {
            originalLine:
              "Unique Field Kindergarten 2 Comprehension",

            similarity: 0,
          },
        ]);
      }
    );

    it(
      "rejects an Akontaa candidate when the customer explicitly requests Unique Field",
      async () => {
        vi.spyOn(
          EducationalProductMatchCoordinator.prototype,
          "findBestMatches"
        ).mockResolvedValue([
          {
            product: {
              id:
                "product-akontaa-kg2",

              sku:
                "TEST-AKONTAA",

              productName:
                "Akontaa for Kindergarten 2A - KG 2",

              retailPrice:
                0,

              stockQty:
                0,
            },

            similarity:
              86,

            legacySimilarity:
              86,

            educationalBookScore:
              0,

            matchingDimensions: [
              "level",
            ],

            differentDimensions: [],

            missingDimensions: [],

            evidenceSources: [
              "LEGACY_FINGERPRINT",
            ],
          },
        ]);

        const result =
          await matchSchoolList(
            [
              "Unique field – Comprehension (KG2)",
            ],
            "KG2"
          );

        expect(result).toEqual([
          {
            originalLine:
              "Unique field – Comprehension (KG2)",

            similarity:
              0,
          },
        ]);
      }
    );
  }
);