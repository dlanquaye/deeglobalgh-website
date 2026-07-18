import { Language } from "../types";

/**
 * Official Educational Knowledge Base (EKB)
 * Supported Languages
 */

export const LANGUAGES: Language[] = [
  {
    id: "language-english",
    code: "LANGUAGE_ENGLISH",
    name: "English",
    aliases: [
      "english",
      "eng",
      "english language",
    ],
    active: true,
  },

  {
    id: "language-french",
    code: "LANGUAGE_FRENCH",
    name: "French",
    aliases: [
      "french",
      "français",
      "francais",
    ],
    active: true,
  },

  {
    id: "language-akan",
    code: "LANGUAGE_AKAN",
    name: "Akan",
    aliases: [
      "akan",
      "twi",
      "asante twi",
      "akuapem twi",
      "fante",
      "mfantse",
    ],
    active: true,
  },

  {
    id: "language-ewe",
    code: "LANGUAGE_EWE",
    name: "Ewe",
    aliases: [
      "ewe",
    ],
    active: true,
  },

  {
    id: "language-ga",
    code: "LANGUAGE_GA",
    name: "Ga",
    aliases: [
      "ga",
      "dangme",
      "ga-dangme",
    ],
    active: true,
  },

  {
    id: "language-dagbani",
    code: "LANGUAGE_DAGBANI",
    name: "Dagbani",
    aliases: [
      "dagbani",
    ],
    active: true,
  },

  {
    id: "language-dagaare",
    code: "LANGUAGE_DAGAARE",
    name: "Dagaare",
    aliases: [
      "dagaare",
    ],
    active: true,
  },

  {
    id: "language-gonja",
    code: "LANGUAGE_GONJA",
    name: "Gonja",
    aliases: [
      "gonja",
    ],
    active: true,
  },

  {
    id: "language-gurune",
    code: "LANGUAGE_GURUNE",
    name: "Gurune",
    aliases: [
      "gurune",
      "frafra",
    ],
    active: true,
  },

  {
    id: "language-kasem",
    code: "LANGUAGE_KASEM",
    name: "Kasem",
    aliases: [
      "kasem",
    ],
    active: true,
  },

  {
    id: "language-nzema",
    code: "LANGUAGE_NZEMA",
    name: "Nzema",
    aliases: [
      "nzema",
    ],
    active: true,
  },
];

export const LANGUAGE_BY_CODE = new Map(
  LANGUAGES.map((language) => [language.code, language]),
);

export const LANGUAGE_BY_NAME = new Map(
  LANGUAGES.map((language) => [
    language.name.toLowerCase(),
    language,
  ]),
);