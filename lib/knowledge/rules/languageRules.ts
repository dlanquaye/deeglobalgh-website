import { KnowledgeRule } from "../engine/types";

export const languageRules: KnowledgeRule[] = [
  {
    nodeCode: "LANG_ENGLISH",
    priority: 100,
    baseScore: 100,
    patterns: [
      "english",
      "english language"
    ]
  },

  {
    nodeCode: "LANG_FRENCH",
    priority: 100,
    baseScore: 100,
    patterns: [
      "french",
      "français"
    ]
  },

  {
    nodeCode: "LANG_TWI",
    priority: 100,
    baseScore: 100,
    patterns: [
      "twi"
    ]
  },

  {
    nodeCode: "LANG_GA",
    priority: 100,
    baseScore: 100,
    patterns: [
      "ga"
    ]
  },

  {
    nodeCode: "LANG_EWE",
    priority: 100,
    baseScore: 100,
    patterns: [
      "ewe"
    ]
  }
];