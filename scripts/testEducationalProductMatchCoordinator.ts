import {
  EducationalProductMatchCoordinator,
} from "../lib/estimator/EducationalProductMatchCoordinator";

async function main(): Promise<void> {
  console.log(
    "Testing Educational Product Match Coordinator...",
  );

  const coordinator =
    new EducationalProductMatchCoordinator();

  const queries = [
    "York English Language Basic 1 Textbook NaCCA",
    "Golden Maths P4 Workbook NaCCA",
    "ICT JHS 2 Textbook",
  ];

  for (const query of queries) {
    console.log("");
    console.log("Query");
    console.log("-----");
    console.log(query);

    const results =
      await coordinator.findBestMatches(
        query,
        5,
      );

    if (results.length === 0) {
      console.log(
        "No active Product match was found.",
      );

      continue;
    }

    results.forEach(
      (result, index) => {
        console.log("");
        console.log(
          `Result ${index + 1}`,
        );
        console.log(
          `Product: ${result.product.productName}`,
        );
        console.log(
          `Product ID: ${result.product.id}`,
        );
        console.log(
          `SKU: ${result.product.sku}`,
        );
        console.log(
          `Final similarity: ${result.similarity}`,
        );
        console.log(
          `Legacy similarity: ${result.legacySimilarity}`,
        );
        console.log(
          `EKB score: ${result.educationalBookScore}`,
        );
        console.log(
          `Evidence: ${result.evidenceSources.join(", ") || "NONE"}`,
        );

        if (
          result.educationalBookName
        ) {
          console.log(
            `Educational Book: ${result.educationalBookName}`,
          );
        }
      },
    );
  }

  const blankResults =
    await coordinator.findBestMatches(
      "   ",
      5,
    );

  if (blankResults.length !== 0) {
    throw new Error(
      "Blank-query protection failed.",
    );
  }

  console.log("");
  console.log(
    "PASSED: blank-query protection",
  );

  const limitedResults =
    await coordinator.findBestMatches(
      "English",
      1,
    );

  if (limitedResults.length > 1) {
    throw new Error(
      "Result-limit protection failed.",
    );
  }

  console.log(
    "PASSED: result-limit protection",
  );

  console.log("");
  console.log(
    "Educational Product Match Coordinator verification completed successfully.",
  );
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error(
      "Educational Product Match Coordinator verification failed.",
    );

    console.error(error);

    process.exitCode = 1;
  });