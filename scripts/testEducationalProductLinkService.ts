import {
  prisma,
} from "../lib/prisma";

import {
  EducationalProductLinkService,
} from "../lib/ekb/linking/EducationalProductLinkService";

const ALREADY_LINKED_SKU =
  "DG-B1-MTH-BB-024";

const ELIGIBLE_UNLINKED_SKU =
  "DG-B6-MTH-BB-029";

const LOW_CONFIDENCE_SKU =
  "DG-JHS-ENG-BB-023";

async function main(): Promise<void> {
  console.log(
    "Testing EducationalProductLinkService...",
  );

  const service =
    new EducationalProductLinkService(
      prisma,
    );

  const alreadyLinked =
    await service.previewBySku(
      ALREADY_LINKED_SKU,
    );

  if (!alreadyLinked) {
    throw new Error(
      "Already-linked Product could not be found.",
    );
  }

  console.log("");
  console.log("Already-linked protection");
  console.log("-------------------------");
  console.log(
    `SKU: ${alreadyLinked.sku}`,
  );
  console.log(
    `Status: ${alreadyLinked.status}`,
  );
  console.log(
    `Reason: ${alreadyLinked.reason}`,
  );

  if (
    alreadyLinked.status
    !== "ALREADY_LINKED"
  ) {
    throw new Error(
      `Expected ALREADY_LINKED, received ${alreadyLinked.status}.`,
    );
  }

  console.log(
    "PASSED: already-linked protection",
  );

  const eligiblePreview =
    await service.previewBySku(
      ELIGIBLE_UNLINKED_SKU,
    );

  if (!eligiblePreview) {
    throw new Error(
      "Eligible unlinked Product could not be found.",
    );
  }

  console.log("");
  console.log("Eligible preview");
  console.log("----------------");
  console.log(
    `SKU: ${eligiblePreview.sku}`,
  );
  console.log(
    `Product: ${eligiblePreview.productName}`,
  );
  console.log(
    `Status: ${eligiblePreview.status}`,
  );
  console.log(
    `Book: ${eligiblePreview.bookName ?? "NONE"}`,
  );
  console.log(
    `Best score: ${eligiblePreview.bestScore}`,
  );
  console.log(
    `Second score: ${eligiblePreview.secondScore}`,
  );
  console.log(
    `Margin: ${eligiblePreview.scoreMargin}`,
  );
  console.log(
    `Edition ID: ${eligiblePreview.editionId ?? "NONE"}`,
  );

  if (
    eligiblePreview.status
    !== "ELIGIBLE"
  ) {
    throw new Error(
      `Expected ELIGIBLE, received ${eligiblePreview.status}.`,
    );
  }

  if (
    !eligiblePreview.bookEntityId
    || !eligiblePreview.editionId
  ) {
    throw new Error(
      "Eligible preview is missing its EKB identifiers.",
    );
  }

  console.log(
    "PASSED: eligible preview",
  );

  const lowConfidencePreview =
    await service.previewBySku(
      LOW_CONFIDENCE_SKU,
    );

  if (!lowConfidencePreview) {
    throw new Error(
      "Low-confidence Product could not be found.",
    );
  }

  console.log("");
  console.log("Low-confidence protection");
  console.log("-------------------------");
  console.log(
    `SKU: ${lowConfidencePreview.sku}`,
  );
  console.log(
    `Status: ${lowConfidencePreview.status}`,
  );
  console.log(
    `Best score: ${lowConfidencePreview.bestScore}`,
  );
  console.log(
    `Reason: ${lowConfidencePreview.reason}`,
  );

  if (
    lowConfidencePreview.status
    !== "LOW_CONFIDENCE"
  ) {
    throw new Error(
      `Expected LOW_CONFIDENCE, received ${lowConfidencePreview.status}.`,
    );
  }

  console.log(
    "PASSED: low-confidence protection",
  );

  const blankSku =
    await service.previewBySku(
      "   ",
    );

  if (blankSku !== null) {
    throw new Error(
      "Blank SKU protection failed.",
    );
  }

  console.log("");
  console.log(
    "PASSED: blank SKU protection",
  );

  console.log("");
  console.log(
    "EducationalProductLinkService verification completed successfully.",
  );
}

main()
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "EducationalProductLinkService verification failed.",
      );
      console.error(error);

      process.exitCode = 1;
    },
  )
  .finally(
    async () => {
      await prisma.$disconnect();
    },
  );