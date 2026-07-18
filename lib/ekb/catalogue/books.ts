import { Book } from "../types";

/**
 * Educational Knowledge Base (EKB)
 * Official Book Catalogue
 *
 * Each record represents ONE educational resource.
 *
 * A Book Line may contain many Books.
 *
 * Example:
 * Practical Mathematics
 *     ├── Basic 1 Learner Book
 *     ├── Basic 1 Teacher Guide
 *     ├── Basic 1 Workbook
 *     ├── Basic 2 Learner Book
 *     └── ...
 */

export const BOOKS: Book[] = [
  {
    id: "golden-english-b4-lb",

    title: "Golden English for Basic Schools",

    publisherCode: "PUB_NEW_GOLDEN",

    bookLineCode: "BOOKLINE_GOLDEN_ENGLISH",

    subjectCode: "SUB_ENGLISH",

    levelCode: "LEVEL_B4",

    resourceTypeCode: "RESOURCE_LEARNER_BOOK",

    curriculumCode: "CURRICULUM_NACCA",

    languageCode: "LANGUAGE_ENGLISH",

    authorIds: [],

    active: true,
  },

  {
    id: "golden-maths-b5-lb",

    title: "Golden Mathematics for Basic Schools",

    publisherCode: "PUB_NEW_GOLDEN",

    bookLineCode: "BOOKLINE_GOLDEN_MATHEMATICS",

    subjectCode: "SUB_MATHEMATICS",

    levelCode: "LEVEL_B5",

    resourceTypeCode: "RESOURCE_LEARNER_BOOK",

    curriculumCode: "CURRICULUM_NACCA",

    languageCode: "LANGUAGE_ENGLISH",

    authorIds: [],

    active: true,
  },

  {
    id: "bestbrain-eng-b2-lb",

    title: "Best Brain English Language",

    publisherCode: "PUB_BEST_BRAIN",

    bookLineCode: "BOOKLINE_BEST_BRAIN_ENGLISH",

    subjectCode: "SUB_ENGLISH",

    levelCode: "LEVEL_B2",

    resourceTypeCode: "RESOURCE_LEARNER_BOOK",

    curriculumCode: "CURRICULUM_NACCA",

    languageCode: "LANGUAGE_ENGLISH",

    authorIds: [],

    active: true,
  },

  {
    id: "interactive-eng-b3-tg",

    title: "Interactive English Language",

    publisherCode: "PUB_MASTERMAN",

    bookLineCode: "BOOKLINE_INTERACTIVE_ENGLISH",

    subjectCode: "SUB_ENGLISH",

    levelCode: "LEVEL_B3",

    resourceTypeCode: "RESOURCE_TEACHER_GUIDE",

    curriculumCode: "CURRICULUM_NACCA",

    languageCode: "LANGUAGE_ENGLISH",

    authorIds: [],

    active: true,
  },

  {
    id: "practical-maths-b6-wb",

    title: "Practical Mathematics",

    publisherCode: "PUB_MASTERMAN",

    bookLineCode: "BOOKLINE_PRACTICAL_MATHEMATICS",

    subjectCode: "SUB_MATHEMATICS",

    levelCode: "LEVEL_B6",

    resourceTypeCode: "RESOURCE_WORKBOOK",

    curriculumCode: "CURRICULUM_NACCA",

    languageCode: "LANGUAGE_ENGLISH",

    authorIds: [],

    active: true,
  },
];

export const BOOK_BY_ID = new Map(
  BOOKS.map((book) => [book.id, book]),
);