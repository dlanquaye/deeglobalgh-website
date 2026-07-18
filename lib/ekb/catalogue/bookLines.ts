import { BookLine } from "../types";

/**
 * Educational Knowledge Base (EKB)
 * Official Book Lines
 *
 * A Book Line is the canonical educational product line
 * published by a Publisher.
 *
 * Examples:
 *   Practical Mathematics
 *   Golden English for Basic Schools
 *   Best Brain English Language
 *
 * This is NOT the individual book.
 */

export const BOOK_LINES: BookLine[] = [
  // ---------------------------------------------------------------------------
  // Masterman Publications
  // ---------------------------------------------------------------------------

  {
    id: "bookline-practical-mathematics",
    code: "BOOKLINE_PRACTICAL_MATHEMATICS",
    name: "Practical Mathematics",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "practical maths",
      "practical mathematics",
    ],
    active: true,
  },

  {
    id: "bookline-interactive-english",
    code: "BOOKLINE_INTERACTIVE_ENGLISH",
    name: "Interactive English Language",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "interactive english",
      "interactive english language",
    ],
    active: true,
  },

  {
    id: "bookline-new-age-science",
    code: "BOOKLINE_NEW_AGE_SCIENCE",
    name: "New Age Science",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "new age science",
    ],
    active: true,
  },

  {
    id: "bookline-contemporary-science",
    code: "BOOKLINE_CONTEMPORARY_SCIENCE",
    name: "Contemporary Science",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "contemporary science",
    ],
    active: true,
  },

  {
    id: "bookline-expressive-cad",
    code: "BOOKLINE_EXPRESSIVE_CAD",
    name: "Expressive Creative Arts",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "expressive creative arts",
      "expressive creative arts and design",
    ],
    active: true,
  },

  {
    id: "bookline-functional-mathematics",
    code: "BOOKLINE_FUNCTIONAL_MATHEMATICS",
    name: "Functional Mathematics",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "functional mathematics",
    ],
    active: true,
  },

  {
    id: "bookline-concise-social-studies",
    code: "BOOKLINE_CONCISE_SOCIAL_STUDIES",
    name: "Concise Social Studies",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "concise social studies",
    ],
    active: true,
  },

  {
    id: "bookline-career-technology",
    code: "BOOKLINE_CAREER_TECHNOLOGY",
    name: "Career Technology",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "career technology",
    ],
    active: true,
  },

  {
    id: "bookline-activities-owop",
    code: "BOOKLINE_ACTIVITIES_OWOP",
    name: "Activities in Our World and Our People",
    publisherCode: "PUB_MASTERMAN",
    aliases: [
      "activities in our world and our people",
      "activities owop",
    ],
    active: true,
  },

  // ---------------------------------------------------------------------------
  // New Golden Publications
  // ---------------------------------------------------------------------------

  {
  id: "bookline-golden-english",
  code: "BOOKLINE_GOLDEN_ENGLISH",
  name: "Golden English for Basic Schools",

  publisherCode: "PUB_NEW_GOLDEN",
  subjectCode: "SUB_ENGLISH",
  curriculumCode: "CURRICULUM_NACCA",
  languageCode: "LANGUAGE_ENGLISH",

  supportedLevels: [
    "LEVEL_B1",
    "LEVEL_B2",
    "LEVEL_B3",
    "LEVEL_B4",
    "LEVEL_B5",
    "LEVEL_B6",
  ],

  supportedResourceTypes: [
    "RESOURCE_LEARNER_BOOK",
  ],

  aliases: [
    "golden english",
    "golden english language",
  ],

  active: true,
},

  {
  id: "bookline-golden-mathematics",
  code: "BOOKLINE_GOLDEN_MATHEMATICS",
  name: "Golden Mathematics for Basic Schools",

  publisherCode: "PUB_NEW_GOLDEN",
  subjectCode: "SUB_MATHEMATICS",
  curriculumCode: "CURRICULUM_NACCA",
  languageCode: "LANGUAGE_ENGLISH",

  supportedLevels: [
    "LEVEL_B1",
    "LEVEL_B2",
    "LEVEL_B3",
    "LEVEL_B4",
    "LEVEL_B5",
    "LEVEL_B6",
  ],

  supportedResourceTypes: [
    "RESOURCE_LEARNER_BOOK",
  ],

  aliases: [
    "golden mathematics",
    "golden maths",
  ],

  active: true,
},

  {
    id: "bookline-golden-science",
    code: "BOOKLINE_GOLDEN_SCIENCE",
    name: "Golden Science for Basic Schools",
    publisherCode: "PUB_NEW_GOLDEN",
    aliases: [
      "golden science",
    ],
    active: true,
  },

  // ---------------------------------------------------------------------------
  // Best Brain Publications
  // ---------------------------------------------------------------------------

  {
    id: "bookline-best-brain-english",
    code: "BOOKLINE_BEST_BRAIN_ENGLISH",
    name: "Best Brain English Language",
    publisherCode: "PUB_BEST_BRAIN",
    aliases: [
      "best brain english",
    ],
    active: true,
  },

  {
    id: "bookline-best-brain-mathematics",
    code: "BOOKLINE_BEST_BRAIN_MATHEMATICS",
    name: "Best Brain Mathematics",
    publisherCode: "PUB_BEST_BRAIN",
    aliases: [
      "best brain maths",
      "best brain mathematics",
    ],
    active: true,
  },

  {
  id: "bookline-best-brain-science",
  code: "BOOKLINE_BEST_BRAIN_SCIENCE",
  name: "Best Brain Science",

  publisherCode: "PUB_BEST_BRAIN",
  subjectCode: "SUB_SCIENCE",
  curriculumCode: "CURRICULUM_NACCA",
  languageCode: "LANGUAGE_ENGLISH",

  supportedLevels: [
    "LEVEL_B1",
    "LEVEL_B2",
    "LEVEL_B3",
    "LEVEL_B4",
    "LEVEL_B5",
    "LEVEL_B6",
  ],

  supportedResourceTypes: [
    "RESOURCE_LEARNER_BOOK",
  ],

  aliases: [
    "best brain science",
  ],

  active: true,
},

  // ---------------------------------------------------------------------------
  // York Press
  // ---------------------------------------------------------------------------

  {
    id: "bookline-york-english",
    code: "BOOKLINE_YORK_ENGLISH",
    name: "York Series English for Primary Schools",
    publisherCode: "PUB_YORK",
    aliases: [
      "york english",
      "york series english",
    ],
    active: true,
  },

  {
    id: "bookline-york-science",
    code: "BOOKLINE_YORK_SCIENCE",
    name: "York Series Science for Primary Schools",
    publisherCode: "PUB_YORK",
    aliases: [
      "york science",
      "york series science",
    ],
    active: true,
  },
];

export const BOOK_LINE_BY_CODE = new Map(
  BOOK_LINES.map((bookLine) => [bookLine.code, bookLine]),
);

export const BOOK_LINE_BY_NAME = new Map(
  BOOK_LINES.map((bookLine) => [
    bookLine.name.toLowerCase(),
    bookLine,
  ]),
);