import { KnowledgeRule } from "../engine/types";

export const curriculumRules: KnowledgeRule[] = [
  {
    nodeCode: "CURR_PRE_SCHOOL",
    priority: 120,
    baseScore: 100,
    patterns: ["pre-school", "preschool"]
  },

  {
    nodeCode: "CURR_NURSERY",
    priority: 120,
    baseScore: 100,
    patterns: ["nursery"]
  },

  {
    nodeCode: "CURR_KG",
    priority: 120,
    baseScore: 100,
    patterns: ["kg", "kindergarten"]
  },

  {
    nodeCode: "CURR_BASIC_1",
    priority: 120,
    baseScore: 100,
    patterns: ["basic 1", "book 1", "grade 1"]
  },

  {
    nodeCode: "CURR_BASIC_2",
    priority: 120,
    baseScore: 100,
    patterns: ["basic 2", "book 2", "grade 2"]
  },

  {
    nodeCode: "CURR_BASIC_3",
    priority: 120,
    baseScore: 100,
    patterns: ["basic 3", "book 3", "grade 3"]
  },

  {
    nodeCode: "CURR_BASIC_4",
    priority: 120,
    baseScore: 100,
    patterns: ["basic 4", "book 4", "grade 4"]
  },

  {
    nodeCode: "CURR_BASIC_5",
    priority: 120,
    baseScore: 100,
    patterns: ["basic 5", "book 5", "grade 5"]
  },

  {
    nodeCode: "CURR_BASIC_6",
    priority: 120,
    baseScore: 100,
    patterns: ["basic 6", "book 6", "grade 6"]
  },

  {
    nodeCode: "CURR_JHS",
    priority: 100,
    baseScore: 100,
    patterns: ["jhs", "junior high"]
  },

  {
    nodeCode: "CURR_SHS",
    priority: 100,
    baseScore: 100,
    patterns: ["shs", "senior high"]
  },

  {
    nodeCode: "CURR_BECE",
    priority: 100,
    baseScore: 100,
    patterns: ["bece"]
  },

  {
    nodeCode: "CURR_WASSCE",
    priority: 100,
    baseScore: 100,
    patterns: ["wassce"]
  }
];