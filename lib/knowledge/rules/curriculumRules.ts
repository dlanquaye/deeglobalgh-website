import { KnowledgeRule } from "../engine/types";

export const curriculumRules: KnowledgeRule[] = [
  {
    nodeCode: "CURR_PRE_SCHOOL",
    priority: 120,
    baseScore: 100,
    patterns: ["pre-school", "preschool"],
  },

  {
    nodeCode: "CURR_NURSERY",
    priority: 120,
    baseScore: 100,
    patterns: ["nursery"],
  },

  {
    nodeCode: "CURR_KG",
    priority: 120,
    baseScore: 100,
    patterns: [
      "kg",
      "kg1",
      "kg2",
      "kindergarten",
    ],
  },

  {
    nodeCode: "CURR_BASIC_1",
    priority: 120,
    baseScore: 100,
    patterns: [
      "basic 1",
      "basic1",
      "b1",
      "book 1",
      "grade 1",
      "primary 1",
      "primary1",
    ],
  },

  {
    nodeCode: "CURR_BASIC_2",
    priority: 120,
    baseScore: 100,
    patterns: [
      "basic 2",
      "basic2",
      "b2",
      "book 2",
      "grade 2",
      "primary 2",
      "primary2",
    ],
  },

  {
    nodeCode: "CURR_BASIC_3",
    priority: 120,
    baseScore: 100,
    patterns: [
      "basic 3",
      "basic3",
      "b3",
      "book 3",
      "grade 3",
      "primary 3",
      "primary3",
    ],
  },

  {
    nodeCode: "CURR_BASIC_4",
    priority: 120,
    baseScore: 100,
    patterns: [
      "basic 4",
      "basic4",
      "b4",
      "book 4",
      "grade 4",
      "primary 4",
      "primary4",
    ],
  },

  {
    nodeCode: "CURR_BASIC_5",
    priority: 120,
    baseScore: 100,
    patterns: [
      "basic 5",
      "basic5",
      "b5",
      "book 5",
      "grade 5",
      "primary 5",
      "primary5",
    ],
  },

  {
    nodeCode: "CURR_BASIC_6",
    priority: 120,
    baseScore: 100,
    patterns: [
      "basic 6",
      "basic6",
      "b6",
      "book 6",
      "grade 6",
      "primary 6",
      "primary6",
    ],
  },

  {
    nodeCode: "CURR_JHS",
    priority: 100,
    baseScore: 100,
    patterns: [
      "jhs",
      "junior high",
      "jhs1",
      "jhs2",
      "jhs3",
    ],
  },

  {
    nodeCode: "CURR_SHS",
    priority: 100,
    baseScore: 100,
    patterns: [
      "shs",
      "senior high",
      "shs1",
      "shs2",
      "shs3",
    ],
  },

  {
    nodeCode: "CURR_BECE",
    priority: 100,
    baseScore: 100,
    patterns: ["bece"],
  },

  {
    nodeCode: "CURR_WASSCE",
    priority: 100,
    baseScore: 100,
    patterns: ["wassce"],
  },
];