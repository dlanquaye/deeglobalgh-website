import { buildEducationalFingerprint } from "../lib/knowledge/engine/buildEducationalFingerprint";

const fingerprint = buildEducationalFingerprint(
  "Golden English Language Textbook Book 4"
);

console.dir(fingerprint, {
  depth: null,
});