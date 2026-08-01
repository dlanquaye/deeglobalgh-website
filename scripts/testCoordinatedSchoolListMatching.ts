import {
  matchSchoolList,
} from "../lib/ocr/matchSchoolList";

async function main(): Promise<void> {
  console.log(
    "Testing coordinated school-list matching...",
  );

  const schoolListLines = [
    "York English Language Basic 1 Textbook NaCCA",
    "Golden Maths P4 Workbook NaCCA",
    "ICT JHS 2 Textbook",
  ];

  const results =
    await matchSchoolList(
      schoolListLines,
    );

  if (
    results.length
    !== schoolListLines.length
  ) {
    throw new Error(
      "The matcher did not return one result for every school-list line.",
    );
  }

  results.forEach(
    (result, index) => {
      console.log("");
      console.log(
        `Line ${index + 1}`,
      );
      console.log(
        `Original: ${result.originalLine}`,
      );
      console.log(
        `Matched product: ${result.matchedProductName ?? "NONE"}`,
      );
      console.log(
        `Matched product ID: ${result.matchedProductId ?? "NONE"}`,
      );
      console.log(
        `Similarity: ${result.similarity}`,
      );

      if (
        result.originalLine
        !== schoolListLines[index]
      ) {
        throw new Error(
          `Original-line preservation failed for line ${index + 1}.`,
        );
      }

      if (
        !Number.isFinite(
          result.similarity,
        )
      ) {
        throw new Error(
          `Invalid similarity returned for line ${index + 1}.`,
        );
      }

      if (
        result.similarity < 0
        || result.similarity > 100
      ) {
        throw new Error(
          `Similarity is outside the permitted 0–100 range for line ${index + 1}.`,
        );
      }
    },
  );

  const blankResults =
    await matchSchoolList([
      "   ",
    ]);

  if (
    blankResults.length !== 1
  ) {
    throw new Error(
      "Blank-line protection did not preserve the input line.",
    );
  }

  if (
    blankResults[0].matchedProductId
    !== undefined
  ) {
    throw new Error(
      "A blank school-list line was incorrectly matched to a Product.",
    );
  }

  if (
    blankResults[0].similarity !== 0
  ) {
    throw new Error(
      "A blank school-list line did not return similarity 0.",
    );
  }

  console.log("");
  console.log(
    "PASSED: one result returned per input line",
  );
  console.log(
    "PASSED: original lines preserved",
  );
  console.log(
    "PASSED: similarity range protection",
  );
  console.log(
    "PASSED: blank-line protection",
  );

  console.log("");
  console.log(
    "Coordinated school-list matching verification completed successfully.",
  );
}

main()
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "Coordinated school-list matching verification failed.",
      );
      console.error(error);

      process.exitCode = 1;
    },
  );