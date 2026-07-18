import { Curriculum } from "../types";

/**
 * Official Educational Knowledge Base (EKB)
 * Supported Curricula
 */

export const CURRICULA: Curriculum[] = [
  {
    id: "curriculum-nacca",
    code: "CURRICULUM_NACCA",
    name: "NaCCA Standards-Based Curriculum",
    country: "Ghana",
    aliases: [
      "nacca",
      "ghana curriculum",
      "standards based curriculum",
      "standards-based curriculum",
      "cbc",
      "ghana standards based curriculum",
    ],
    active: true,
  },

  {
    id: "curriculum-old-ges",
    code: "CURRICULUM_GES_LEGACY",
    name: "GES Legacy Curriculum",
    country: "Ghana",
    aliases: [
      "ges syllabus",
      "old syllabus",
      "legacy curriculum",
      "old curriculum",
    ],
    active: true,
  },

  {
    id: "curriculum-cambridge",
    code: "CURRICULUM_CAMBRIDGE",
    name: "Cambridge International",
    country: "International",
    aliases: [
      "cambridge",
      "cambridge international",
      "cie",
      "cambridge curriculum",
    ],
    active: true,
  },

  {
    id: "curriculum-ib",
    code: "CURRICULUM_IB",
    name: "International Baccalaureate",
    country: "International",
    aliases: [
      "ib",
      "international baccalaureate",
    ],
    active: true,
  },

  {
    id: "curriculum-waec",
    code: "CURRICULUM_WAEC",
    name: "WAEC Examination Resources",
    country: "West Africa",
    aliases: [
      "waec",
      "wassce",
      "bece",
      "waec syllabus",
      "exam preparation",
    ],
    active: true,
  },
];

export const CURRICULUM_BY_CODE = new Map(
  CURRICULA.map((curriculum) => [curriculum.code, curriculum]),
);

export const CURRICULUM_BY_NAME = new Map(
  CURRICULA.map((curriculum) => [
    curriculum.name.toLowerCase(),
    curriculum,
  ]),
);