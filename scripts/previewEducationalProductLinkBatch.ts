import {
  PrismaClient,
} from "@prisma/client";

import {
  EducationalProductBatchLinkService,
} from "../lib/ekb/linking/EducationalProductBatchLinkService";

import {
  EducationalProductLinkPreview,
  EducationalProductLinkStatus,
} from "../lib/ekb/linking/EducationalProductLinkService";

const prisma =
  new PrismaClient();

const BATCH_LIMIT = 250;

const BATCH_OFFSET = 0;

const MINIMUM_SCORE = 55;

const MINIMUM_MARGIN = 15;

const STATUS_ORDER:
  EducationalProductLinkStatus[] = [
    "ELIGIBLE",
    "LINKED",
    "ALREADY_LINKED",
    "NO_CANDIDATE",
    "LOW_CONFIDENCE",
    "SMALL_MARGIN",
    "MISSING_EDITION",
  ];

function formatScore(
  value:
    number
    | null
    | undefined,
): string {
  if (
    value === null
    || value === undefined
  ) {
    return "N/A";
  }

  return value.toFixed(2);
}

function formatValue(
  value:
    string
    | null
    | undefined,
): string {
  const normalizedValue =
    value?.trim();

  return normalizedValue
    || "None";
}

function formatValues(
  values:
    string[]
    | undefined,
): string {
  if (
    !values
    || values.length === 0
  ) {
    return "None";
  }

  return values.join(", ");
}

function formatCompatibility(
  value:
    boolean
    | undefined,
): string {
  if (value === undefined) {
    return "Not evaluated";
  }

  return value
    ? "YES"
    : "NO";
}

function printEligibleResult(
  result:
    EducationalProductLinkPreview,
): void {
  console.log("");
  console.log(
    "------------------------------------------------------------",
  );
  console.log(
    `Product: ${result.productName}`,
  );
  console.log(
    `SKU: ${result.sku}`,
  );
  console.log(
    `Status: ${result.status}`,
  );
  console.log(
    `Search query: ${result.query}`,
  );
  console.log(
    `Matched book: ${result.bookName ?? "N/A"}`,
  );
  console.log(
    `Book ID: ${result.bookId ?? "N/A"}`,
  );
  console.log(
    `Book entity ID: ${result.bookEntityId ?? "N/A"}`,
  );
  console.log(
    `Edition ID: ${result.editionId ?? "N/A"}`,
  );
  console.log(
    `Product publisher: ${formatValue(result.productPublisher)}`,
  );
  console.log(
    `Candidate publisher: ${formatValue(result.candidatePublisher)}`,
  );
  console.log(
    `Candidate subjects: ${formatValues(result.candidateSubjects)}`,
  );
  console.log(
    `Candidate resource types: ${formatValues(result.candidateResourceTypes)}`,
  );
  console.log(
    `Product levels: ${formatValues(result.productLevels)}`,
  );
  console.log(
    `Candidate levels: ${formatValues(result.candidateLevels)}`,
  );
  console.log(
    `Matching levels: ${formatValues(result.matchingLevels)}`,
  );
  console.log(
    `Exact-level compatible: ${formatCompatibility(result.exactLevelCompatible)}`,
  );
  console.log(
    `Best score: ${formatScore(result.bestScore)}`,
  );
  console.log(
    `Second score: ${formatScore(result.secondScore)}`,
  );
  console.log(
    `Score margin: ${formatScore(result.scoreMargin)}`,
  );

  if (result.reason) {
    console.log(
      `Reason: ${result.reason}`,
    );
  }
}

function printSkippedResult(
  result:
    EducationalProductLinkPreview,
): void {
  console.log("");
  console.log(
    [
      result.status,
      result.sku,
      result.productName,
    ].join(" | "),
  );
  console.log(
    `  Matched book: ${result.bookName ?? "N/A"}`,
  );
  console.log(
    `  Product publisher: ${formatValue(result.productPublisher)}`,
  );
  console.log(
    `  Candidate publisher: ${formatValue(result.candidatePublisher)}`,
  );
  console.log(
    `  Candidate subjects: ${formatValues(result.candidateSubjects)}`,
  );
  console.log(
    `  Candidate resource types: ${formatValues(result.candidateResourceTypes)}`,
  );
  console.log(
    `  Product levels: ${formatValues(result.productLevels)}`,
  );
  console.log(
    `  Candidate levels: ${formatValues(result.candidateLevels)}`,
  );
  console.log(
    `  Matching levels: ${formatValues(result.matchingLevels)}`,
  );
  console.log(
    `  Exact-level compatible: ${formatCompatibility(result.exactLevelCompatible)}`,
  );
  console.log(
    `  Best score: ${formatScore(result.bestScore)}`,
  );
  console.log(
    `  Score margin: ${formatScore(result.scoreMargin)}`,
  );
  console.log(
    `  Reason: ${result.reason ?? "No additional reason recorded."}`,
  );
}

async function main():
  Promise<void> {
  console.log(
    "Educational Product Link Batch Preview",
  );
  console.log(
    "======================================",
  );
  console.log(
    `Batch limit: ${BATCH_LIMIT}`,
  );
  console.log(
    `Selection offset: ${BATCH_OFFSET}`,
  );
  console.log(
    `Minimum score: ${MINIMUM_SCORE}`,
  );
  console.log(
    `Minimum margin: ${MINIMUM_MARGIN}`,
  );
  console.log(
    "Mode: PREVIEW ONLY — no database writes",
  );

  const service =
    new EducationalProductBatchLinkService(
      prisma,
      {
        limit:
          BATCH_LIMIT,

        offset:
          BATCH_OFFSET,

        minimumScore:
          MINIMUM_SCORE,

        minimumMargin:
          MINIMUM_MARGIN,
      },
    );

  const report =
    await service
      .previewActiveUnlinkedProducts();

  console.log("");
  console.log(
    "Batch summary",
  );
  console.log(
    "-------------",
  );
  console.log(
    `Offset: ${report.offset}`,
  );
  console.log(
    `Selected: ${report.selected}`,
  );
  console.log(
    `Processed: ${report.processed}`,
  );

  for (
    const status
    of STATUS_ORDER
  ) {
    console.log(
      `${status}: ${report.counts[status]}`,
    );
  }

  const eligibleResults =
    report.results.filter(
      (result) =>
        result.status
        === "ELIGIBLE",
    );

  const skippedResults =
    report.results.filter(
      (result) =>
        result.status
        !== "ELIGIBLE",
    );

  console.log("");
  console.log(
    `Eligible matches requiring review: ${eligibleResults.length}`,
  );

  if (
    eligibleResults.length
    === 0
  ) {
    console.log(
      "No products in this batch are currently eligible for linking.",
    );
  } else {
    for (
      const result
      of eligibleResults
    ) {
      printEligibleResult(
        result,
      );
    }
  }

  console.log("");
  console.log(
    `Skipped or protected products: ${skippedResults.length}`,
  );
  console.log(
    "--------------------------------",
  );

  if (
    skippedResults.length
    === 0
  ) {
    console.log(
      "No products were skipped.",
    );
  } else {
    for (
      const result
      of skippedResults
    ) {
      printSkippedResult(
        result,
      );
    }
  }

  console.log("");
  console.log(
    "Preview completed. No Product or ProductFingerprint records were changed.",
  );
}

main()
  .catch(
    (
      error:
        unknown,
    ) => {
      console.error(
        "Educational product link batch preview failed.",
      );

      console.error(
        error instanceof Error
          ? error.stack
            ?? error.message
          : String(error),
      );

      process.exitCode = 1;
    },
  )
  .finally(
    async () => {
      await prisma
        .$disconnect();
    },
  );