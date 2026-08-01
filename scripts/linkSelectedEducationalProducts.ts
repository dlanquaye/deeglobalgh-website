import {
  prisma,
} from "../lib/prisma";

import {
  BookReadService,
} from "../lib/ekb/services/BookReadService";

import {
  EducationalBookSearchService,
  EducationalBookSearchResult,
} from "../lib/ekb/search/EducationalBookSearchService";

const TARGET_SKUS = [
  "DG-B1-MTH-BB-024",
  "DG-B1-SCI-BB-031",
  "DG-B1-ENG-ESS-052",
  "DG-B1-MTH-GLD-107",
];

const MINIMUM_SCORE = 55;

const MINIMUM_MARGIN = 15;

interface LinkingSummary {
  inspected: number;

  linked: number;

  skippedAlreadyLinked: number;

  skippedNoCandidate: number;

  skippedLowConfidence: number;

  skippedSmallMargin: number;

  failed: number;
}

async function main(): Promise<void> {
  console.log(
    "Linking selected Products to verified EKB Editions...",
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

            educationalEntityId: true,

            educationalEditionId: true,
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

    skippedAlreadyLinked: 0,

    skippedNoCandidate: 0,

    skippedLowConfidence: 0,

    skippedSmallMargin: 0,

    failed: 0,
  };

  console.log("");
  console.log(
    `Selected Products found: ${products.length}`,
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
      product.educationalEditionId
      || product.educationalEntityId
    ) {
      summary.skippedAlreadyLinked++;

      console.log(
        "SKIPPED: Product already has an EKB relationship.",
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
      summary.skippedNoCandidate++;

      console.log(
        "SKIPPED: No EKB candidate was found.",
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
      summary.skippedLowConfidence++;

      console.log(
        `SKIPPED: Score is below ${MINIMUM_SCORE}.`,
      );

      continue;
    }

    if (
      scoreMargin
      < MINIMUM_MARGIN
    ) {
      summary.skippedSmallMargin++;

      console.log(
        `SKIPPED: Score margin is below ${MINIMUM_MARGIN}.`,
      );

      continue;
    }

    const edition =
      selectCurrentEdition(
        bestCandidate,
      );

    if (!edition) {
      summary.failed++;

      console.log(
        "FAILED: Candidate has no active current Edition.",
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
    "Selected Product linking summary",
  );
  console.log(
    "--------------------------------",
  );
  console.log(
    `Products inspected: ${summary.inspected}`,
  );
  console.log(
    `Products linked: ${summary.linked}`,
  );
  console.log(
    `Already linked: ${summary.skippedAlreadyLinked}`,
  );
  console.log(
    `No candidate: ${summary.skippedNoCandidate}`,
  );
  console.log(
    `Low confidence: ${summary.skippedLowConfidence}`,
  );
  console.log(
    `Small score margin: ${summary.skippedSmallMargin}`,
  );
  console.log(
    `Failures: ${summary.failed}`,
  );

  if (summary.failed > 0) {
    throw new Error(
      `${summary.failed} selected Product linking operation(s) failed.`,
    );
  }

  console.log("");
  console.log(
    "Selected Product-to-EKB linking completed successfully.",
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
        "Selected Product-to-EKB linking failed.",
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