import {
  prisma,
} from "../lib/prisma";

import {
  EducationalBookSearchResult,
  EducationalBookSearchService,
} from "../lib/ekb/search/EducationalBookSearchService";

import {
  BookReadService,
} from "../lib/ekb/services/BookReadService";

const TARGET_SKUS = [
  "DG-B2-MTH-BB-025",
  "DG-B3-MTH-BB-026",
  "DG-B4-MTH-BB-027",
  "DG-B5-MTH-BB-028",
];

const MINIMUM_SCORE = 55;

const MINIMUM_MARGIN = 15;

interface LinkingSummary {
  inspected: number;

  linked: number;

  alreadyLinked: number;

  noCandidate: number;

  lowConfidence: number;

  smallMargin: number;

  missingEdition: number;

  failed: number;
}

async function main(): Promise<void> {
  console.log(
    "Linking approved Product-to-EKB batch...",
  );

  const bookReadService =
    new BookReadService(prisma);

  const searchService =
    new EducationalBookSearchService(
      bookReadService,
    );

  const products =
    await prisma.product.findMany({
      where: {
        sku: {
          in: TARGET_SKUS,
        },
      },

      select: {
        id: true,

        sku: true,

        name: true,

        publisher: true,

        author: true,

        levelSlugs: true,

        educationalEntityId: true,

        educationalEditionId: true,

        fingerprint: {
          select: {
            id: true,
          },
        },
      },

      orderBy: {
        name: "asc",
      },
    });

  const summary: LinkingSummary = {
    inspected: products.length,

    linked: 0,

    alreadyLinked: 0,

    noCandidate: 0,

    lowConfidence: 0,

    smallMargin: 0,

    missingEdition: 0,

    failed: 0,
  };

  console.log("");
  console.log(
    `Approved Products found: ${products.length}`,
  );

  for (const product of products) {
    console.log("");
    console.log(
      "================================================",
    );
    console.log(
      `Product: ${product.name}`,
    );
    console.log(
      `SKU: ${product.sku}`,
    );

    if (
      product.educationalEntityId
      || product.educationalEditionId
    ) {
      summary.alreadyLinked++;

      console.log(
        "SKIPPED: Product is already linked.",
      );

      continue;
    }

    const query =
      buildSearchQuery(product);

    const candidates =
      await searchService.search({
        query,

        limit: 2,
      });

    if (
      candidates.length === 0
    ) {
      summary.noCandidate++;

      console.log(
        "SKIPPED: No EKB candidate.",
      );

      continue;
    }

    const bestCandidate =
      candidates[0];

    const secondCandidate =
      candidates[1];

    const scoreMargin =
      bestCandidate.score
      - (
        secondCandidate?.score
        ?? 0
      );

    console.log(
      `Best candidate: ${bestCandidate.book.entity.canonicalName}`,
    );
    console.log(
      `Best score: ${bestCandidate.score}`,
    );
    console.log(
      `Second score: ${secondCandidate?.score ?? "NONE"}`,
    );
    console.log(
      `Score margin: ${scoreMargin}`,
    );

    if (
      bestCandidate.score
      < MINIMUM_SCORE
    ) {
      summary.lowConfidence++;

      console.log(
        `SKIPPED: Score is below ${MINIMUM_SCORE}.`,
      );

      continue;
    }

    if (
      scoreMargin
      < MINIMUM_MARGIN
    ) {
      summary.smallMargin++;

      console.log(
        `SKIPPED: Margin is below ${MINIMUM_MARGIN}.`,
      );

      continue;
    }

    const edition =
      selectCurrentEdition(
        bestCandidate,
      );

    if (!edition) {
      summary.missingEdition++;

      console.log(
        "SKIPPED: Candidate has no active published Edition.",
      );

      continue;
    }

    try {
      await prisma.$transaction(
        async (transaction) => {
          await transaction.product.update({
            where: {
              id: product.id,
            },

            data: {
              educationalEntityId:
                bestCandidate.book.entityId,

              educationalEditionId:
                edition.id,

              classificationConfidence:
                bestCandidate.score,

              educationalVerified:
                true,

              educationalLastSyncedAt:
                new Date(),
            },
          });

          if (product.fingerprint) {
            await transaction.productFingerprint.update({
              where: {
                id: product.fingerprint.id,
              },

              data: {
                educationalEntityId:
                  bestCandidate.book.entityId,

                educationalEditionId:
                  edition.id,
              },
            });
          }
        },
      );

      summary.linked++;

      console.log(
        `LINKED: ${bestCandidate.book.entity.canonicalName}`,
      );
      console.log(
        `Edition ID: ${edition.id}`,
      );
    } catch (error: unknown) {
      summary.failed++;

      console.error(
        "FAILED:",
        error,
      );
    }
  }

  console.log("");
  console.log(
    "================================================",
  );
  console.log(
    "Approved batch linking summary",
  );
  console.log(
    "------------------------------",
  );
  console.log(
    `Products inspected: ${summary.inspected}`,
  );
  console.log(
    `Products linked: ${summary.linked}`,
  );
  console.log(
    `Already linked: ${summary.alreadyLinked}`,
  );
  console.log(
    `No candidate: ${summary.noCandidate}`,
  );
  console.log(
    `Low confidence: ${summary.lowConfidence}`,
  );
  console.log(
    `Small margin: ${summary.smallMargin}`,
  );
  console.log(
    `Missing Edition: ${summary.missingEdition}`,
  );
  console.log(
    `Failures: ${summary.failed}`,
  );

  if (
    products.length
    !== TARGET_SKUS.length
  ) {
    throw new Error(
      `Expected ${TARGET_SKUS.length} approved Products, found ${products.length}.`,
    );
  }

  if (summary.failed > 0) {
    throw new Error(
      `${summary.failed} approved Product linking operation(s) failed.`,
    );
  }

  console.log("");
  console.log(
    "Approved Product-to-EKB batch linking completed successfully.",
  );
}

function buildSearchQuery(
  product: {
    name: string;

    publisher: string | null;

    author: string | null;

    levelSlugs: string[];
  },
): string {
  return Array.from(
    new Set(
      [
        product.name,

        product.publisher,

        product.author,

        ...product.levelSlugs,
      ]
        .map(
          (value) =>
            value?.trim(),
        )
        .filter(
          (
            value,
          ): value is string =>
            Boolean(value),
        ),
    ),
  ).join(" ");
}

function selectCurrentEdition(
  candidate:
    EducationalBookSearchResult,
) {
  return (
    candidate.book.editions.find(
      (edition) =>
        edition.isCurrentEdition
        && edition.isActive
        && edition.isPublished,
    )
    ?? candidate.book.editions.find(
      (edition) =>
        edition.isActive
        && edition.isPublished,
    )
    ?? candidate.book.editions[0]
  );
}

main()
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "Approved Product-to-EKB batch linking failed.",
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