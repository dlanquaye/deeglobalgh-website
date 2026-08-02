import {
  KnowledgeRule,
} from "../engine/types";

/**
 * Ghana Education Service / NaCCA educational-level rules.
 *
 * Specific stage descriptions receive higher priority than
 * generic phrases such as "Book 1". This prevents a request
 * such as "JHS 1 Book 1" from being classified as Basic 1.
 */
export const levelRules: KnowledgeRule[] = [
  {
    nodeCode: "LEVEL_CR",
    priority: 120,
    baseScore: 100,
    patterns: [
      "creche",
      "cr che",
    ],
  },

  {
    nodeCode: "LEVEL_CR",
    priority: 60,
    baseScore: 100,
    patterns: [
      "nursery",
    ],
  },

  {
    nodeCode: "LEVEL_KG1",
    priority: 180,
    baseScore: 100,
    patterns: [
      "kindergarten 1",
      "kindergarten1",
      "kg 1",
      "kg1",
      "k g 1",
      "nursery 1",
      "nursery1",
    ],
  },

  {
    nodeCode: "LEVEL_KG2",
    priority: 180,
    baseScore: 100,
    patterns: [
      "kindergarten 2",
      "kindergarten2",
      "kg 2",
      "kg2",
      "k g 2",
      "nursery 2",
      "nursery2",
    ],
  },

  {
    nodeCode: "LEVEL_B1",
    priority: 160,
    baseScore: 100,
    patterns: [
      "basic 1",
      "basic1",
      "primary 1",
      "primary1",
      "p 1",
      "p1",
      "b 1",
      "b1",
    ],
  },

  {
    nodeCode: "LEVEL_B1",
    priority: 110,
    baseScore: 100,
    patterns: [
      "class 1",
      "class1",
    ],
  },

  {
    nodeCode: "LEVEL_B1",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 1",
      "book1",
    ],
  },

  {
    nodeCode: "LEVEL_B2",
    priority: 160,
    baseScore: 100,
    patterns: [
      "basic 2",
      "basic2",
      "primary 2",
      "primary2",
      "p 2",
      "p2",
      "b 2",
      "b2",
    ],
  },

  {
    nodeCode: "LEVEL_B2",
    priority: 110,
    baseScore: 100,
    patterns: [
      "class 2",
      "class2",
    ],
  },

  {
    nodeCode: "LEVEL_B2",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 2",
      "book2",
    ],
  },

  {
    nodeCode: "LEVEL_B3",
    priority: 160,
    baseScore: 100,
    patterns: [
      "basic 3",
      "basic3",
      "primary 3",
      "primary3",
      "p 3",
      "p3",
      "b 3",
      "b3",
    ],
  },

  {
    nodeCode: "LEVEL_B3",
    priority: 110,
    baseScore: 100,
    patterns: [
      "class 3",
      "class3",
    ],
  },

  {
    nodeCode: "LEVEL_B3",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 3",
      "book3",
    ],
  },

  {
    nodeCode: "LEVEL_B4",
    priority: 160,
    baseScore: 100,
    patterns: [
      "basic 4",
      "basic4",
      "primary 4",
      "primary4",
      "p 4",
      "p4",
      "b 4",
      "b4",
    ],
  },

  {
    nodeCode: "LEVEL_B4",
    priority: 110,
    baseScore: 100,
    patterns: [
      "class 4",
      "class4",
    ],
  },

  {
    nodeCode: "LEVEL_B4",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 4",
      "book4",
    ],
  },

  {
    nodeCode: "LEVEL_B5",
    priority: 160,
    baseScore: 100,
    patterns: [
      "basic 5",
      "basic5",
      "primary 5",
      "primary5",
      "p 5",
      "p5",
      "b 5",
      "b5",
    ],
  },

  {
    nodeCode: "LEVEL_B5",
    priority: 110,
    baseScore: 100,
    patterns: [
      "class 5",
      "class5",
    ],
  },

  {
    nodeCode: "LEVEL_B5",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 5",
      "book5",
    ],
  },

  {
    nodeCode: "LEVEL_B6",
    priority: 160,
    baseScore: 100,
    patterns: [
      "basic 6",
      "basic6",
      "primary 6",
      "primary6",
      "p 6",
      "p6",
      "b 6",
      "b6",
    ],
  },

  {
    nodeCode: "LEVEL_B6",
    priority: 110,
    baseScore: 100,
    patterns: [
      "class 6",
      "class6",
    ],
  },

  {
    nodeCode: "LEVEL_B6",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 6",
      "book6",
    ],
  },

  {
    nodeCode: "LEVEL_B7",
    priority: 190,
    baseScore: 100,
    patterns: [
      "basic 7",
      "basic7",
      "b 7",
      "b7",
      "jhs 1",
      "jhs1",
      "j h s 1",
      "junior high 1",
      "junior high school 1",
    ],
  },

  {
    nodeCode: "LEVEL_B7",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 7",
      "book7",
    ],
  },

  {
    nodeCode: "LEVEL_B8",
    priority: 190,
    baseScore: 100,
    patterns: [
      "basic 8",
      "basic8",
      "b 8",
      "b8",
      "jhs 2",
      "jhs2",
      "j h s 2",
      "junior high 2",
      "junior high school 2",
    ],
  },

  {
    nodeCode: "LEVEL_B8",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 8",
      "book8",
    ],
  },

  {
    nodeCode: "LEVEL_B9",
    priority: 190,
    baseScore: 100,
    patterns: [
      "basic 9",
      "basic9",
      "b 9",
      "b9",
      "jhs 3",
      "jhs3",
      "j h s 3",
      "junior high 3",
      "junior high school 3",
    ],
  },

  {
    nodeCode: "LEVEL_B9",
    priority: 70,
    baseScore: 100,
    patterns: [
      "book 9",
      "book9",
    ],
  },

  {
    nodeCode: "LEVEL_SHS1",
    priority: 200,
    baseScore: 100,
    patterns: [
      "shs 1",
      "shs1",
      "s h s 1",
      "senior high 1",
      "senior high school 1",
      "form 1",
      "form1",
    ],
  },

  {
    nodeCode: "LEVEL_SHS2",
    priority: 200,
    baseScore: 100,
    patterns: [
      "shs 2",
      "shs2",
      "s h s 2",
      "senior high 2",
      "senior high school 2",
      "form 2",
      "form2",
    ],
  },

  {
    nodeCode: "LEVEL_SHS3",
    priority: 200,
    baseScore: 100,
    patterns: [
      "shs 3",
      "shs3",
      "s h s 3",
      "senior high 3",
      "senior high school 3",
      "form 3",
      "form3",
    ],
  },
];