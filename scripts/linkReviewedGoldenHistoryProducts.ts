import {
  PrismaClient,
} from "@prisma/client";

import {
  EducationalProductLinkService,
} from "../lib/ekb/linking/EducationalProductLinkService";

const prisma =
  new PrismaClient();

const GLOBAL_AUTOMATIC_MINIMUM_SCORE =
  55;

const REVIEWED_MINIMUM_SCORE =
  52;

const MINIMUM_MARGIN =
  15;

const EXPECTED_SCORE =
  52;

const EXPECTED_MARGIN =
  17;

const BOOK_NAME =
  "Golden History of Ghana for Basic Schools";

const BOOK_ENTITY_ID =
  "cmrtsba7c036jg3d0i98vbacn";

const EDITION_ID =
  "cmsawo78g00b8g3akkpxgleot";

const CANDIDATE_PUBLISHER =
  "New Golden Publication";

const CANDIDATE_SUBJECTS = [
  "History of Ghana",
];

const CANDIDATE_RESOURCE_TYPES = [
  "Textbook",
];

const CANDIDATE_LEVELS = [
  "Basic 1",
  "Basic 2",
  "Basic 3",
  "Basic 4",
  "Basic 5",
  "Basic 6",
];

interface ApprovedEducationalProductLink {
  expectedSku: string;

  productName: string;

  matchingLevels: string[];
}

interface ApprovedProductIdentity {
  productId: string;

  actualSku: string;
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

  productId:
    string;

  actualSku:
    string;

  status:
    | "ELIGIBLE"
    | "ALREADY_LINKED";
}

const APPROVED_LINKS:
  ApprovedEducationalProductLink[] = [
    {
      expectedSku:
        "DG-B1-HIS-GLD-098",

      productName:
        "Golden History Textbook for Basic 1",

      matchingLevels: [
        "Basic 1",
      ],
    },
    {
      expectedSku:
        "DG-B1-HIS-GLD-099",

      productName:
        "Golden History Textbook for Basic 2",

      matchingLevels: [
        "Basic 2",
      ],
    },
    {
      expectedSku:
        "DG-B1-HIS-GLD-100",

      productName:
        "Golden History Textbook for Basic 3",

      matchingLevels: [
        "Basic 3",
      ],
    },
    {
      expectedSku:
        "DG-B1-HIS-GLD-101",

      productName:
        "Golden History Textbook for Basic 4",

      matchingLevels: [
        "Basic 4",
      ],
    },
    {
      expectedSku:
        "DG-B1-HIS-GLD-102",

      productName:
        "Golden History Textbook for Basic 5",

      matchingLevels: [
        "Basic 5",
      ],
    },
    {
      expectedSku:
        "DG-B1-HIS-GLD-103",

      productName:
        "Golden History Textbook for Basic 6",

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
    .toLocaleLowerCase(
      "en",
    )
    .replace(
      /\s+/g,
      " ",
    );
}

function assertValue(
  label:
    string,

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
    normaliseValue(
      actual,
    )
    !== normaliseValue(
      expected,
    )
  ) {
    throw new Error(
      [
        `${label} did not match the approved value.`,
        `Expected: ${expected ?? "None"}.`,
        `Actual: ${actual ?? "None"}.`,
      ].join(
        " ",
      ),
    );
  }
}

function assertValues(
  label:
    string,

  actual:
    | string[]
    | null
    | undefined,

  expected:
    string[],
): void {
  const normalisedActual =
    (
      actual
      ?? []
    )
      .map(
        normaliseValue,
      )
      .sort();

  const normalisedExpected =
    expected
      .map(
        normaliseValue,
      )
      .sort();

  const valuesMatch =
    normalisedActual.length
      === normalisedExpected.length
    && normalisedActual.every(
      (
        value,
        index,
      ) =>
        value
        === normalisedExpected[index],
    );

  if (
    !valuesMatch
  ) {
    throw new Error(
      [
        `${label} did not match the approved values.`,
        `Expected: ${expected.join(", ") || "None"}.`,
        `Actual: ${(actual ?? []).join(", ") || "None"}.`,
      ].join(
        " ",
      ),
    );
  }
}

function assertNumber(
  label:
    string,

  actual:
    number,

  expected:
    number,
): void {
  if (
    actual
    !== expected
  ) {
    throw new Error(
      [
        `${label} changed from the manually reviewed value.`,
        `Expected: ${expected}.`,
        `Actual: ${actual}.`,
      ].join(
        " ",
      ),
    );
  }
}

async function findApprovedProduct(
  approved:
    ApprovedEducationalProductLink,
): Promise<ApprovedProductIdentity> {
  const products =
    await prisma.product.findMany({
      where: {
        isActive:
          true,

        name:
          approved.productName,
      },

      select: {
        id:
          true,

        sku:
          true,

        name:
          true,
      },
    });

  if (
    products.length
    !== 1
  ) {
    throw new Error(
      [
        `Expected exactly one active Product named "${approved.productName}".`,
        `Found: ${products.length}.`,
      ].join(
        " ",
      ),
    );
  }

  const product =
    products[0];

  assertValue(
    `${approved.productName} Product name`,
    product.name,
    approved.productName,
  );

  /*
   * Basic 4 currently has leading whitespace in its stored SKU.
   * The trimmed value must match the manually approved SKU.
   *
   * Product ID is used for previewing and linking because the shared
   * SKU methods correctly trim their input before querying, which
   * cannot locate a legacy database value containing leading space.
   */
  assertValue(
    `${approved.productName} trimmed SKU`,
    product.sku,
    approved.expectedSku,
  );

  return {
    productId:
      product.id,

    actualSku:
      product.sku,
  };
}

function assertReviewedPreview(
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
        `${approved.expectedSku} is not eligible under the controlled reviewed threshold.`,
        `Current status: ${preview.status}.`,
        `Reason: ${preview.reason ?? "None"}.`,
      ].join(
        " ",
      ),
    );
  }

  assertNumber(
    `${approved.expectedSku} best score`,
    preview.bestScore,
    EXPECTED_SCORE,
  );

  assertNumber(
    `${approved.expectedSku} score margin`,
    preview.scoreMargin,
    EXPECTED_MARGIN,
  );

  if (
    preview.bestScore
    < REVIEWED_MINIMUM_SCORE
  ) {
    throw new Error(
      `${approved.expectedSku} is below the controlled reviewed minimum score.`,
    );
  }

  if (
    preview.scoreMargin
    < MINIMUM_MARGIN
  ) {
    throw new Error(
      `${approved.expectedSku} is below the approved minimum score margin.`,
    );
  }

  if (
    preview.exactLevelCompatible
    !== true
  ) {
    throw new Error(
      `${approved.expectedSku} failed the exact-level safeguard.`,
    );
  }

  assertValue(
    `${approved.expectedSku} Product name`,
    preview.productName,
    approved.productName,
  );

  assertValue(
    `${approved.expectedSku} Educational Book`,
    preview.bookName,
    BOOK_NAME,
  );

  assertValue(
    `${approved.expectedSku} Educational Book entity`,
    preview.bookEntityId,
    BOOK_ENTITY_ID,
  );

  assertValue(
    `${approved.expectedSku} Educational Edition`,
    preview.editionId,
    EDITION_ID,
  );

  assertValue(
    `${approved.expectedSku} candidate publisher`,
    preview.candidatePublisher,
    CANDIDATE_PUBLISHER,
  );

  assertValues(
    `${approved.expectedSku} candidate subjects`,
    preview.candidateSubjects,
    CANDIDATE_SUBJECTS,
  );

  assertValues(
    `${approved.expectedSku} candidate resource types`,
    preview.candidateResourceTypes,
    CANDIDATE_RESOURCE_TYPES,
  );

  assertValues(
    `${approved.expectedSku} candidate levels`,
    preview.candidateLevels,
    CANDIDATE_LEVELS,
  );

  assertValues(
    `${approved.expectedSku} exact matching levels`,
    preview.matchingLevels,
    approved.matchingLevels,
  );
}

async function verifyExistingLink(
  approved:
    ApprovedEducationalProductLink,

  productId:
    string,
): Promise<void> {
  const product =
    await prisma.product.findUnique({
      where: {
        id:
          productId,
      },

      select: {
        id:
          true,

        sku:
          true,

        name:
          true,

        educationalEntityId:
          true,

        educationalEditionId:
          true,

        educationalVerified:
          true,

        fingerprint: {
          select: {
            educationalEntityId:
              true,

            educationalEditionId:
              true,
          },
        },
      },
    });

  if (
    !product
  ) {
    throw new Error(
      `Product ${approved.expectedSku} could not be found during verification.`,
    );
  }

  assertValue(
    `${approved.expectedSku} stored SKU`,
    product.sku,
    approved.expectedSku,
  );

  assertValue(
    `${approved.expectedSku} stored Product name`,
    product.name,
    approved.productName,
  );

  assertValue(
    `${approved.expectedSku} stored Educational Book entity`,
    product.educationalEntityId,
    BOOK_ENTITY_ID,
  );

  assertValue(
    `${approved.expectedSku} stored Educational Edition`,
    product.educationalEditionId,
    EDITION_ID,
  );

  if (
    product.educationalVerified
    !== true
  ) {
    throw new Error(
      `Product ${approved.expectedSku} is linked but is not educationally verified.`,
    );
  }

  if (
    !product.fingerprint
  ) {
    throw new Error(
      `Product ${approved.expectedSku} has no ProductFingerprint after linking.`,
    );
  }

  assertValue(
    `${approved.expectedSku} fingerprint Educational Book entity`,
    product.fingerprint.educationalEntityId,
    BOOK_ENTITY_ID,
  );

  assertValue(
    `${approved.expectedSku} fingerprint Educational Edition`,
    product.fingerprint.educationalEditionId,
    EDITION_ID,
  );
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
    const identity =
      await findApprovedProduct(
        approved,
      );

    const preview =
      await service.previewByProductId(
        identity.productId,
      );

    if (
      !preview
    ) {
      throw new Error(
        `Approved Product ${approved.expectedSku} could not be previewed by Product ID.`,
      );
    }

    if (
      preview.status
      === "ALREADY_LINKED"
    ) {
      await verifyExistingLink(
        approved,
        identity.productId,
      );

      preparedLinks.push({
        approved,

        productId:
          identity.productId,

        actualSku:
          identity.actualSku,

        status:
          "ALREADY_LINKED",
      });

      console.log(
        [
          "VERIFIED EXISTING LINK",
          approved.expectedSku,
          approved.productName,
        ].join(
          " | ",
        ),
      );

      continue;
    }

    assertReviewedPreview(
      approved,
      preview,
    );

    preparedLinks.push({
      approved,

      productId:
        identity.productId,

      actualSku:
        identity.actualSku,

      status:
        "ELIGIBLE",
    });

    console.log(
      [
        "APPROVED FOR CONTROLLED LINKING",
        approved.expectedSku,
        approved.productName,
        `Book: ${BOOK_NAME}`,
        `Level: ${approved.matchingLevels.join(", ")}`,
        `Score: ${preview.bestScore}`,
        `Margin: ${preview.scoreMargin}`,
      ].join(
        " | ",
      ),
    );
  }

  return preparedLinks;
}

async function main():
  Promise<void> {
  console.log(
    "Reviewed Golden History Product Link Execution",
  );
  console.log(
    "==============================================",
  );
  console.log(
    `Approved Products: ${APPROVED_LINKS.length}`,
  );
  console.log(
    `Global automatic minimum score remains: ${GLOBAL_AUTOMATIC_MINIMUM_SCORE}`,
  );
  console.log(
    `Controlled reviewed score required: ${EXPECTED_SCORE}`,
  );
  console.log(
    `Minimum margin: ${MINIMUM_MARGIN}`,
  );
  console.log(
    `Exact reviewed margin required: ${EXPECTED_MARGIN}`,
  );
  console.log(
    "Mode: CONTROLLED WRITE - six manually approved Golden History Products only",
  );
  console.log(
    "Lookup method: stable Product ID",
  );
  console.log("");

  const service =
    new EducationalProductLinkService(
      prisma,
      {
        /*
         * This threshold applies only inside this manually reviewed
         * one-off script. It does not alter the global automatic
         * linking threshold of 55.
         */
        minimumScore:
          REVIEWED_MINIMUM_SCORE,

        minimumMargin:
          MINIMUM_MARGIN,
      },
    );

  console.log(
    "Running complete preflight verification...",
  );
  console.log("");

  /*
   * Every approved Product must pass before the first write begins.
   */
  const preparedLinks =
    await prepareApprovedLinks(
      service,
    );

  console.log("");
  console.log(
    "Preflight verification passed for all six approved Products.",
  );
  console.log(
    "Beginning controlled linking...",
  );
  console.log("");

  let linked =
    0;

  let alreadyLinked =
    0;

  for (
    const prepared
    of preparedLinks
  ) {
    if (
      prepared.status
      === "ALREADY_LINKED"
    ) {
      alreadyLinked +=
        1;

      console.log(
        [
          "SKIPPED",
          prepared.approved.expectedSku,
          "Correct link already exists.",
        ].join(
          " | ",
        ),
      );

      continue;
    }

    const result =
      await service.linkByProductId(
        prepared.productId,
      );

    if (
      !result
    ) {
      throw new Error(
        `Product ${prepared.approved.expectedSku} disappeared during linking.`,
      );
    }

    if (
      result.status
      !== "LINKED"
    ) {
      throw new Error(
        [
          `Product ${prepared.approved.expectedSku} was not linked.`,
          `Status: ${result.status}.`,
          `Reason: ${result.reason ?? "None"}.`,
        ].join(
          " ",
        ),
      );
    }

    assertValue(
      `${prepared.approved.expectedSku} linked Educational Book entity`,
      result.bookEntityId,
      BOOK_ENTITY_ID,
    );

    assertValue(
      `${prepared.approved.expectedSku} linked Educational Edition`,
      result.editionId,
      EDITION_ID,
    );

    await verifyExistingLink(
      prepared.approved,
      prepared.productId,
    );

    linked +=
      1;

    console.log(
      [
        "LINKED",
        prepared.approved.expectedSku,
        prepared.approved.productName,
        `Book: ${BOOK_NAME}`,
      ].join(
        " | ",
      ),
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
    "Reviewed Golden History linking completed successfully.",
  );
}

main()
  .catch(
    (
      error:
        unknown,
    ) => {
      console.error(
        "Reviewed Golden History linking failed.",
      );

      console.error(
        error instanceof Error
          ? error.stack
            ?? error.message
          : String(
            error,
          ),
      );

      process.exitCode =
        1;
    },
  )
  .finally(
    async () => {
      await prisma
        .$disconnect();
    },
  );