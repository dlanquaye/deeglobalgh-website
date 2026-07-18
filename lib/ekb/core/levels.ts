import { Level } from "../types";

/**
 * Official Educational Knowledge Base (EKB)
 * Ghana Education Service / NaCCA Levels
 */

export const LEVELS: Level[] = [
  {
    id: "level-cr",
    code: "LEVEL_CR",
    name: "Creche",
    order: 0,
    aliases: ["creche", "crèche", "nursery"],
    active: true,
  },

  {
    id: "level-kg1",
    code: "LEVEL_KG1",
    name: "KG 1",
    order: 1,
    aliases: [
      "kg1",
      "kg 1",
      "kindergarten 1",
      "nursery 1",
    ],
    active: true,
  },

  {
    id: "level-kg2",
    code: "LEVEL_KG2",
    name: "KG 2",
    order: 2,
    aliases: [
      "kg2",
      "kg 2",
      "kindergarten 2",
      "nursery 2",
    ],
    active: true,
  },

  {
    id: "level-b1",
    code: "LEVEL_B1",
    name: "Basic 1",
    order: 3,
    aliases: [
      "basic 1",
      "b1",
      "primary 1",
      "p1",
      "class 1",
      "book 1",
    ],
    active: true,
  },

  {
    id: "level-b2",
    code: "LEVEL_B2",
    name: "Basic 2",
    order: 4,
    aliases: [
      "basic 2",
      "b2",
      "primary 2",
      "p2",
      "class 2",
      "book 2",
    ],
    active: true,
  },

  {
    id: "level-b3",
    code: "LEVEL_B3",
    name: "Basic 3",
    order: 5,
    aliases: [
      "basic 3",
      "b3",
      "primary 3",
      "p3",
      "class 3",
      "book 3",
    ],
    active: true,
  },

  {
    id: "level-b4",
    code: "LEVEL_B4",
    name: "Basic 4",
    order: 6,
    aliases: [
      "basic 4",
      "b4",
      "primary 4",
      "p4",
      "class 4",
      "book 4",
    ],
    active: true,
  },

  {
    id: "level-b5",
    code: "LEVEL_B5",
    name: "Basic 5",
    order: 7,
    aliases: [
      "basic 5",
      "b5",
      "primary 5",
      "p5",
      "class 5",
      "book 5",
    ],
    active: true,
  },

  {
    id: "level-b6",
    code: "LEVEL_B6",
    name: "Basic 6",
    order: 8,
    aliases: [
      "basic 6",
      "b6",
      "primary 6",
      "p6",
      "class 6",
      "book 6",
    ],
    active: true,
  },

  {
    id: "level-b7",
    code: "LEVEL_B7",
    name: "Basic 7",
    order: 9,
    aliases: [
      "basic 7",
      "b7",
      "jhs 1",
      "jhs1",
      "junior high 1",
      "book 7",
    ],
    active: true,
  },

  {
    id: "level-b8",
    code: "LEVEL_B8",
    name: "Basic 8",
    order: 10,
    aliases: [
      "basic 8",
      "b8",
      "jhs 2",
      "jhs2",
      "junior high 2",
      "book 8",
    ],
    active: true,
  },

  {
    id: "level-b9",
    code: "LEVEL_B9",
    name: "Basic 9",
    order: 11,
    aliases: [
      "basic 9",
      "b9",
      "jhs 3",
      "jhs3",
      "junior high 3",
      "book 9",
    ],
    active: true,
  },

  {
    id: "level-shs1",
    code: "LEVEL_SHS1",
    name: "SHS 1",
    order: 12,
    aliases: [
      "shs 1",
      "shs1",
      "senior high 1",
      "form 1",
    ],
    active: true,
  },

  {
    id: "level-shs2",
    code: "LEVEL_SHS2",
    name: "SHS 2",
    order: 13,
    aliases: [
      "shs 2",
      "shs2",
      "senior high 2",
      "form 2",
    ],
    active: true,
  },

  {
    id: "level-shs3",
    code: "LEVEL_SHS3",
    name: "SHS 3",
    order: 14,
    aliases: [
      "shs 3",
      "shs3",
      "senior high 3",
      "form 3",
    ],
    active: true,
  },
];

export const LEVEL_BY_CODE = new Map(
  LEVELS.map((level) => [level.code, level]),
);

export const LEVEL_BY_NAME = new Map(
  LEVELS.map((level) => [level.name.toLowerCase(), level]),
);