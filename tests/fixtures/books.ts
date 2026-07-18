/**
 * ============================================================
 * Canonical Book Test Fixtures
 * ============================================================
 *
 * These fixtures represent the expected educational metadata
 * for known books.
 *
 * They are used by:
 * - Unit tests
 * - Integration tests
 * - OCR tests
 * - Regression tests
 */

export interface BookFixture {
  input: string;

  publisherCode?: string;

  subjectCode?: string;

  levelCode?: string;

  resourceTypeCode?: string;

  curriculumCode?: string;

  languageCode?: string;
}

export const BOOK_FIXTURES: BookFixture[] = [
  {
    input: "Golden English Language Book 4 Learner Book",

    publisherCode: "PUB_NEW_GOLDEN",
    subjectCode: "SUB_ENGLISH",
    levelCode: "LEVEL_B4",
    resourceTypeCode: "RESOURCE_LEARNER_BOOK",
    curriculumCode: "CURRICULUM_NACCA",
    languageCode: "LANGUAGE_ENGLISH",
  },

  {
    input: "Golden Mathematics Book 5 Learner Book",

    publisherCode: "PUB_NEW_GOLDEN",
    subjectCode: "SUB_MATHEMATICS",
    levelCode: "LEVEL_B5",
    resourceTypeCode: "RESOURCE_LEARNER_BOOK",
    curriculumCode: "CURRICULUM_NACCA",
    languageCode: "LANGUAGE_ENGLISH",
  },

  {
  input: "Best Brain Science Book 3",

  publisherCode: "PUB_BEST_BRAIN",
  subjectCode: "SUB_SCIENCE",
  levelCode: "LEVEL_B3",
  resourceTypeCode: "RESOURCE_LEARNER_BOOK",
  curriculumCode: "CURRICULUM_NACCA",
  languageCode: "LANGUAGE_ENGLISH",
},
];