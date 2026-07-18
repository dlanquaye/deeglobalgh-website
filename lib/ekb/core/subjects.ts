import { Subject } from "../types";

/**
 * Official Educational Knowledge Base (EKB)
 * Ghana Education / NaCCA Subjects
 */

export const SUBJECTS: Subject[] = [
  {
    id: "subject-english",
    code: "SUB_ENGLISH",
    name: "English Language",
    shortName: "English",
    aliases: [
      "english",
      "eng",
      "english language",
      "language",
    ],
    active: true,
  },

  {
    id: "subject-maths",
    code: "SUB_MATHEMATICS",
    name: "Mathematics",
    shortName: "Maths",
    aliases: [
      "mathematics",
      "maths",
      "math",
      "mathematics for basic schools",
    ],
    active: true,
  },

  {
    id: "subject-science",
    code: "SUB_SCIENCE",
    name: "Science",
    aliases: [
      "science",
      "integrated science",
      "basic science",
    ],
    active: true,
  },

  {
    id: "subject-computing",
    code: "SUB_COMPUTING",
    name: "Computing",
    aliases: [
      "computing",
      "ict",
      "information and communication technology",
      "computer studies",
      "computer",
    ],
    active: true,
  },

  {
    id: "subject-owop",
    code: "SUB_OWOP",
    name: "Our World Our People",
    shortName: "OWOP",
    aliases: [
      "our world our people",
      "owop",
      "our world",
    ],
    active: true,
  },

  {
    id: "subject-rme",
    code: "SUB_RME",
    name: "Religious and Moral Education",
    shortName: "RME",
    aliases: [
      "rme",
      "religious and moral education",
      "religious education",
      "moral education",
    ],
    active: true,
  },

  {
    id: "subject-career-tech",
    code: "SUB_CAREER_TECH",
    name: "Career Technology",
    aliases: [
      "career technology",
      "career tech",
    ],
    active: true,
  },

  {
    id: "subject-creative-arts",
    code: "SUB_CREATIVE_ARTS",
    name: "Creative Arts and Design",
    shortName: "Creative Arts",
    aliases: [
      "creative arts",
      "creative arts and design",
      "cad",
    ],
    active: true,
  },

  {
    id: "subject-ghanaian-language",
    code: "SUB_GHANAIAN_LANGUAGE",
    name: "Ghanaian Language",
    aliases: [
      "ghanaian language",
      "ghanaian languages",
      "fante",
      "twi",
      "ga",
      "ewe",
      "dagbani",
      "nzema",
      "gonja",
      "kasem",
      "dagaare",
      "gurune",
    ],
    active: true,
  },

  {
    id: "subject-french",
    code: "SUB_FRENCH",
    name: "French",
    aliases: [
      "french",
    ],
    active: true,
  },

  {
    id: "subject-history",
    code: "SUB_HISTORY",
    name: "History",
    aliases: [
      "history",
    ],
    active: true,
  },
];

/**
 * Fast lookup by subject code.
 */
export const SUBJECT_BY_CODE = new Map(
  SUBJECTS.map((subject) => [subject.code, subject]),
);

/**
 * Fast lookup by canonical name.
 */
export const SUBJECT_BY_NAME = new Map(
  SUBJECTS.map((subject) => [subject.name.toLowerCase(), subject]),
);