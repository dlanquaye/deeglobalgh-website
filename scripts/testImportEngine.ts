import { JsonReader } from "../lib/ekb/importers/readers/jsonReader";
import { runImport } from "../lib/ekb/importers/importEngine";

async function main() {
  const reader = new JsonReader([
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
  ]);

  const result = await runImport(reader);

  console.dir(result, {
    depth: null,
  });
}

main();