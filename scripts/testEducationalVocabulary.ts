import {
  EducationalVocabulary,
} from "../lib/ekb/vocabulary/EducationalVocabulary";

function assertEqual(
  actual: unknown,
  expected: unknown,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${message}\nExpected: ${String(expected)}\nActual: ${String(actual)}`,
    );
  }
}

function assertIncludes(
  values: string[],
  expected: string,
  message: string,
): void {
  if (!values.includes(expected)) {
    throw new Error(
      `${message}\nExpected to include: ${expected}\nActual: ${values.join(", ")}`,
    );
  }
}

function printPassed(
  description: string,
): void {
  console.log(`PASSED: ${description}`);
}

function main(): void {
  console.log(
    "Testing Educational Vocabulary...\n",
  );

  const vocabulary =
    new EducationalVocabulary();

  assertEqual(
    vocabulary.normalizeSubject("Maths"),
    "Mathematics",
    "Maths should normalise to Mathematics.",
  );

  printPassed(
    "subject alias: Maths → Mathematics",
  );

  assertEqual(
    vocabulary.normalizeSubject("ICT"),
    "Computing",
    "ICT should normalise to Computing.",
  );

  printPassed(
    "subject alias: ICT → Computing",
  );

  assertEqual(
    vocabulary.normalizeSubject("RME"),
    "Religious and Moral Education",
    "RME should normalise correctly.",
  );

  printPassed(
    "subject alias: RME",
  );

  assertEqual(
    vocabulary.normalizeLevel("P3"),
    "Basic 3",
    "P3 should normalise to Basic 3.",
  );

  printPassed(
    "level alias: P3 → Basic 3",
  );

  assertEqual(
    vocabulary.normalizeLevel("JHS2"),
    "JHS 2",
    "JHS2 should normalise to JHS 2.",
  );

  printPassed(
    "level alias: JHS2 → JHS 2",
  );

  assertEqual(
    vocabulary.normalizeResourceType("WB"),
    "Workbook",
    "WB should normalise to Workbook.",
  );

  printPassed(
    "resource alias: WB → Workbook",
  );

  assertEqual(
    vocabulary.normalizeResourceType(
      "Teacher Manual",
    ),
    "Teacher's Guide",
    "Teacher Manual should normalise to Teacher's Guide.",
  );

  printPassed(
    "resource alias: Teacher Manual",
  );

  assertEqual(
    vocabulary.normalizeCurriculum(
      "Ghana Curriculum",
    ),
    "NaCCA",
    "Ghana Curriculum should normalise to NaCCA.",
  );

  printPassed(
    "curriculum alias: Ghana Curriculum → NaCCA",
  );

  const extraction =
    vocabulary.extract(
      "Golden Maths P4 Workbook NaCCA",
    );

  assertIncludes(
    extraction.subjects.map(
      (match) =>
        match.canonicalValue,
    ),
    "Mathematics",
    "Extraction should identify Mathematics.",
  );

  printPassed(
    "extract Mathematics",
  );

  assertIncludes(
    extraction.levels.map(
      (match) =>
        match.canonicalValue,
    ),
    "Basic 4",
    "Extraction should identify Basic 4.",
  );

  printPassed(
    "extract Basic 4",
  );

  assertIncludes(
    extraction.resourceTypes.map(
      (match) =>
        match.canonicalValue,
    ),
    "Workbook",
    "Extraction should identify Workbook.",
  );

  printPassed(
    "extract Workbook",
  );

  assertIncludes(
    extraction.curricula.map(
      (match) =>
        match.canonicalValue,
    ),
    "NaCCA",
    "Extraction should identify NaCCA.",
  );

  printPassed(
    "extract NaCCA",
  );

  assertEqual(
    extraction.remainingText,
    "golden",
    "Known educational vocabulary should be removed from the remaining title text.",
  );

  printPassed(
    "remaining title text: Golden",
  );

  const combinedExtraction =
    vocabulary.extract(
      "York English B3 Learner Book",
    );

  assertIncludes(
    combinedExtraction.subjects.map(
      (match) =>
        match.canonicalValue,
    ),
    "English Language",
    "Combined extraction should identify English Language.",
  );

  assertIncludes(
    combinedExtraction.levels.map(
      (match) =>
        match.canonicalValue,
    ),
    "Basic 3",
    "Combined extraction should identify Basic 3.",
  );

  assertIncludes(
    combinedExtraction.resourceTypes.map(
      (match) =>
        match.canonicalValue,
    ),
    "Learner Book",
    "Combined extraction should identify Learner Book.",
  );

  assertEqual(
    combinedExtraction.remainingText,
    "york",
    "Combined extraction should leave York as the remaining search text.",
  );

  printPassed(
    "combined educational extraction",
  );

  assertEqual(
    vocabulary.normalizeSubject(
      "Unknown Subject",
    ),
    undefined,
    "Unknown subject values should not produce a false match.",
  );

  printPassed(
    "unknown subject protection",
  );

  assertEqual(
    vocabulary.normalizeLevel(""),
    undefined,
    "Blank level values should not produce a match.",
  );

  printPassed(
    "blank input protection",
  );

  console.log(
    "\nEducational Vocabulary verification completed successfully.",
  );
}

main();