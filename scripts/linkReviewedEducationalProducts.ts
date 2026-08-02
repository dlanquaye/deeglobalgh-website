import {
  PrismaClient,
} from "@prisma/client";

import {
  EducationalProductLinkService,
} from "../lib/ekb/linking/EducationalProductLinkService";

const prisma =
  new PrismaClient();

const MINIMUM_SCORE = 55;

const MINIMUM_MARGIN = 15;

interface ApprovedEducationalProductLink {
  sku: string;

  productName: string;

  bookName: string;

  bookEntityId: string;

  editionId: string;

  candidatePublisher: string;

  candidateSubjects: string[];

  candidateResourceTypes: string[];

  candidateLevels: string[];

  matchingLevels: string[];
}

interface EducationalProductLinkPreview {
  status: string;

  reason?: string | null;

  productName: string;

  bookName?: string | null;

  bookEntityId?: string | null;

  editionId?: string | null;

  bestScore: number;

  scoreMargin: number;

  exactLevelCompatible?: boolean;

  candidatePublisher?: string | null;

  candidateSubjects?: string[] | null;

  candidateResourceTypes?: string[] | null;

  candidateLevels?: string[] | null;

  matchingLevels?: string[] | null;
}

interface PreparedEducationalProductLink {
  approved:
    ApprovedEducationalProductLink;

  status:
    | "ELIGIBLE"
    | "ALREADY_LINKED";
}

const ESSENTIAL_SCIENCE_BOOK_NAME =
  "Essential Science Primary 6";

const ESSENTIAL_SCIENCE_BOOK_ENTITY_ID =
  "cmrts0fs801apg3d0q7ji48hv";

const ESSENTIAL_SCIENCE_EDITION_ID =
  "cmsawnuh9008bg3akpbb92h15";

const ESSENTIAL_SCIENCE_PUBLISHER =
  "NNF Esquire Limited";

const ESSENTIAL_SCIENCE_SUBJECTS = [
  "Science",
];

const ESSENTIAL_SCIENCE_RESOURCE_TYPES = [
  "Textbook",
];

const ESSENTIAL_SCIENCE_LEVELS = [
  "Basic 6",
];

const APPROVED_LINKS:
  ApprovedEducationalProductLink[] = [
    {
      sku:
        "DG-B6-SCI-ESS-063",

      productName:
        "Essential Science Textbook For Basic 6",

      bookName:
        ESSENTIAL_SCIENCE_BOOK_NAME,

      bookEntityId:
        ESSENTIAL_SCIENCE_BOOK_ENTITY_ID,

      editionId:
        ESSENTIAL_SCIENCE_EDITION_ID,

      candidatePublisher:
        ESSENTIAL_SCIENCE_PUBLISHER,

      candidateSubjects:
        ESSENTIAL_SCIENCE_SUBJECTS,

      candidateResourceTypes:
        ESSENTIAL_SCIENCE_RESOURCE_TYPES,

      candidateLevels:
        ESSENTIAL_SCIENCE_LEVELS,

      matchingLevels: [
        "Basic 6",
      ],
    },
  ];

function normaliseValue(
  value:
    | string
    | null
    | undefined,
): string {
  return (
    value
    ?? ""
  )
    .trim()
    .toLocaleLowerCase("en")
    .replace(/\s+/g, " ");
}

function assertValue(
  label: string,

  actual:
    | string
    | null
    | undefined,

  expected:
    | string
    | null
    | undefined,
): void {
  if (
    normaliseValue(actual)
    !== normaliseValue(expected)
  ) {
    throw new Error(
      [
        `${label} did not match the approved value.`,
        `Expected: ${expected ?? "None"}.`,
        `Actual: ${actual ?? "None"}.`,
      ].join(" "),
    );
  }
}

function assertValues(
  label: string,

  actual:
    | string[]
    | null
    | undefined,

  expected: string[],
): void {
  const normalisedActual =
    (actual ?? [])
      .map(normaliseValue)
      .sort();

  const normalisedExpected =
    expected
      .map(normaliseValue)
      .sort();

  if (
    normalisedActual.length
      !== normalisedExpected.length
    || normalisedActual.some(
      (
        value,
        index,
      ) =>
        value
        !== normalisedExpected[index],
    )
  ) {
    throw new Error(
      [
        `${label} did not match the approved values.`,
        `Expected: ${expected.join(", ") || "None"}.`,
        `Actual: ${(actual ?? []).join(", ") || "None"}.`,
      ].join(" "),
    );
  }
}

function assertEligiblePreview(
  approved:
    ApprovedEducationalProductLink,

  preview:
    EducationalProductLinkPreview,
): void {
  if (
    preview.status
    !== "ELIGIBLE"
  ) {
    throw new Error(
      [
        `Approved SKU ${approved.sku} is no longer eligible.`,
        `Current status: ${preview.status}.`,
        `Reason: ${preview.reason ?? "None"}.`,
      ].join(" "),
    );
  }

  if (
    preview.bestScore
    < MINIMUM_SCORE
  ) {
    throw new Error(
      `SKU ${approved.sku} is below the approved minimum score.`,
    );
  }

  if (
    preview.scoreMargin
    < MINIMUM_MARGIN
  ) {
    throw new Error(
      `SKU ${approved.sku} is below the approved minimum score margin.`,
    );
  }

  if (
    preview.exactLevelCompatible
    !== true
  ) {
    throw new Error(
      `SKU ${approved.sku} failed the exact-level safeguard.`,
    );
  }

  assertValue(
    `${approved.sku} Product name`,
    preview.productName,
    approved.productName,
  );

  assertValue(
    `${approved.sku} Educational Book`,
    preview.bookName,
    approved.bookName,
  );

  assertValue(
    `${approved.sku} Educational Book entity`,
    preview.bookEntityId,
    approved.bookEntityId,
  );

  assertValue(
    `${approved.sku} Educational Edition`,
    preview.editionId,
    approved.editionId,
  );

  assertValue(
    `${approved.sku} candidate publisher`,
    preview.candidatePublisher,
    approved.candidatePublisher,
  );

  assertValues(
    `${approved.sku} candidate subjects`,
    preview.candidateSubjects,
    approved.candidateSubjects,
  );

  assertValues(
    `${approved.sku} candidate resource types`,
    preview.candidateResourceTypes,
    approved.candidateResourceTypes,
  );

  assertValues(
    `${approved.sku} candidate levels`,
    preview.candidateLevels,
    approved.candidateLevels,
  );

  assertValues(
    `${approved.sku} exact matching levels`,
    preview.matchingLevels,
    approved.matchingLevels,
  );
}

async function verifyExistingLink(
  approved:
    ApprovedEducationalProductLink,
): Promise<void> {
  const product =
    await prisma.product.findFirst({
      where: {
        sku:
          approved.sku,
      },

      select: {
        name: true,

        educationalEntityId: true,

        educationalEditionId: true,

        educationalVerified: true,
      },
    });

  if (!product) {
    throw new Error(
      `Product ${approved.sku} could not be found during link verification.`,
    );
  }

  assertValue(
    `${approved.sku} Product name`,
    product.name,
    approved.productName,
  );

  assertValue(
    `${approved.sku} stored Educational Book entity`,
    product.educationalEntityId,
    approved.bookEntityId,
  );

  assertValue(
    `${approved.sku} stored Educational Edition`,
    product.educationalEditionId,
    approved.editionId,
  );

  if (
    product.educationalVerified
    !== true
  ) {
    throw new Error(
      `Product ${approved.sku} has an EKB link but is not marked as educationally verified.`,
    );
  }
}

async function prepareApprovedLinks(
  service:
    EducationalProductLinkService,
): Promise<
  PreparedEducationalProductLink[]
> {
  const preparedLinks:
    PreparedEducationalProductLink[] = [];

  for (
    const approved
    of APPROVED_LINKS
  ) {
    const preview =
      await service.previewBySku(
        approved.sku,
      );

    if (!preview) {
      throw new Error(
        `Approved Product ${approved.sku} could not be found.`,
      );
    }

    if (
      preview.status
      === "ALREADY_LINKED"
    ) {
      await verifyExistingLink(
        approved,
      );

      preparedLinks.push({
        approved,

        status:
          "ALREADY_LINKED",
      });

      console.log(
        [
          "VERIFIED EXISTING LINK",
          approved.sku,
          approved.productName,
        ].join(" | "),
      );

      continue;
    }

    assertEligiblePreview(
      approved,
      preview,
    );

    preparedLinks.push({
      approved,

      status:
        "ELIGIBLE",
    });

    console.log(
      [
        "APPROVED FOR LINKING",
        approved.sku,
        approved.productName,
        `Book: ${approved.bookName}`,
        `Level: ${approved.matchingLevels.join(", ")}`,
      ].join(" | "),
    );
  }

  return preparedLinks;
}

async function main():
  Promise<void> {
  console.log(
    "Reviewed Educational Product Link Execution",
  );
  console.log(
    "===========================================",
  );
  console.log(
    `Approved Products: ${APPROVED_LINKS.length}`,
  );
  console.log(
    `Minimum score: ${MINIMUM_SCORE}`,
  );
  console.log(
    `Minimum margin: ${MINIMUM_MARGIN}`,
  );
  console.log(
    "Mode: CONTROLLED WRITE — approved SKUs only",
  );
  console.log("");

  const service =
    new EducationalProductLinkService(
      prisma,
      {
        minimumScore:
          MINIMUM_SCORE,

        minimumMargin:
          MINIMUM_MARGIN,
      },
    );

  console.log(
    "Running complete preflight verification...",
  );
  console.log("");

  const preparedLinks =
    await prepareApprovedLinks(
      service,
    );

  console.log("");
  console.log(
    "Preflight verification passed for every approved Product.",
  );
  console.log(
    "Beginning controlled linking...",
  );

  let linked = 0;

  let alreadyLinked = 0;

  for (
    const prepared
    of preparedLinks
  ) {
    if (
      prepared.status
      === "ALREADY_LINKED"
    ) {
      alreadyLinked += 1;

      console.log(
        [
          "SKIPPED",
          prepared.approved.sku,
          "Correct link already exists.",
        ].join(" | "),
      );

      continue;
    }

    const result =
      await service.linkBySku(
        prepared.approved.sku,
      );

    if (!result) {
      throw new Error(
        `Product ${prepared.approved.sku} disappeared during linking.`,
      );
    }

    if (
      result.status
      !== "LINKED"
    ) {
      throw new Error(
        [
          `Product ${prepared.approved.sku} was not linked.`,
          `Status: ${result.status}.`,
          `Reason: ${result.reason ?? "None"}.`,
        ].join(" "),
      );
    }

    assertValue(
      `${prepared.approved.sku} linked Educational Book entity`,
      result.bookEntityId,
      prepared.approved.bookEntityId,
    );

    assertValue(
      `${prepared.approved.sku} linked Educational Edition`,
      result.editionId,
      prepared.approved.editionId,
    );

    await verifyExistingLink(
      prepared.approved,
    );

    linked += 1;

    console.log(
      [
        "LINKED",
        prepared.approved.sku,
        prepared.approved.productName,
        `Book: ${prepared.approved.bookName}`,
      ].join(" | "),
    );
  }

  console.log("");
  console.log(
    "Controlled linking summary",
  );
  console.log(
    "--------------------------",
  );
  console.log(
    `Approved: ${APPROVED_LINKS.length}`,
  );
  console.log(
    `Newly linked: ${linked}`,
  );
  console.log(
    `Already correctly linked: ${alreadyLinked}`,
  );
  console.log(
    `Failed: ${
      APPROVED_LINKS.length
      - linked
      - alreadyLinked
    }`,
  );
  console.log("");
  console.log(
    "Reviewed Educational Product linking completed successfully.",
  );
}

main()
  .catch(
    (
      error:
        unknown,
    ) => {
      console.error(
        "Reviewed Educational Product linking failed.",
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