import { importNaccaData } from "../lib/ekb/importers/importer";

const sample = [
  {
    publisher: "New Golden Publications",

    title: "Golden English for Basic Schools",

    subject: "English Language",

    level: "Basic 4",

    resourceType: "Learner Book",

    language: "English",

    curriculum: "NaCCA",

    authors: [],
  },
];

console.dir(
  importNaccaData(sample),
  {
    depth: null,
  },
);