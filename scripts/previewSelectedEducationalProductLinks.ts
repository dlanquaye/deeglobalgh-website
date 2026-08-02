import {
  prisma,
} from "../lib/prisma";

import {
  EducationalBookSearchService,
} from "../lib/ekb/search/EducationalBookSearchService";

import {
  BookReadService,
} from "../lib/ekb/services/BookReadService";

const TARGET_PRODUCT_NAME =
  "Golden History";

const PREVIEW_LIMIT = 10;

async function main():
  Promise<void> {
  console.log(
    "Previewing Golden History Product-to-EKB relationships...",
  );

  console.log(
    "Mode: PREVIEW ONLY - no database writes",
  );

  const bookReadService =
    new BookReadService(
      prisma,
    );

  const searchService =
    new EducationalBookSearchService(
      bookReadService,
    );

  const products =
    await prisma.product.findMany({
      where: {
        isActive: true,

        educationalEntityId: null,

        educationalEditionId: null,

        name: {
          contains:
            TARGET_PRODUCT_NAME,

          mode:
            "insensitive",
        },
      },

      select: {
        id: true,
        sku: true,
        name: true,
        publisher: true,
        author: true,
        levelSlugs: true,

        fingerprint: {
          select: {
            educationalEntityId:
              true,

            educationalEditionId:
              true,
          },
        },
      },

      orderBy: [
        {
          name:
            "asc",
        },
        {
          sku:
            "asc",
        },
      ],

      take:
        PREVIEW_LIMIT,
    });

  if (
    products.length === 0
  ) {
    throw new Error(
      "No active unlinked Golden History Products could be found.",
    );
  }

  console.log("");
  console.log(
    `Selected Products found: ${products.length}`,
  );

  if (
    products.length !== 6
  ) {
    console.log(
      "Review warning: six Golden History Products were expected for Basic 1-6.",
    );
  }

  for (
    const product
    of products
  ) {
    const query =
      buildSearchQuery(
        product,
      );

    const candidates =
      await searchService.search({
        query,

        limit: 5,
      });

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
    console.log(
      `Product publisher: ${product.publisher ?? "NONE"}`,
    );
    console.log(
      `Product author: ${product.author ?? "NONE"}`,
    );
    console.log(
      `Product levels: ${
        product.levelSlugs.join(
          ", ",
        )
        || "NONE"
      }`,
    );
    console.log(
      `Product entity link: ${
        product.fingerprint
          ?.educationalEntityId
        ?? "NONE"
      }`,
    );
    console.log(
      `Product edition link: ${
        product.fingerprint
          ?.educationalEditionId
        ?? "NONE"
      }`,
    );
    console.log(
      `Search query: ${query}`,
    );

    if (
      candidates.length === 0
    ) {
      console.log(
        "No EKB candidates found.",
      );

      continue;
    }

    const bestScore =
      candidates[0].score;

    const secondScore =
      candidates[1]?.score
      ?? null;

    const scoreMargin =
      secondScore === null
        ? null
        : bestScore
          - secondScore;

    console.log("");
    console.log(
      `Best score: ${bestScore}`,
    );
    console.log(
      `Second score: ${secondScore ?? "NONE"}`,
    );
    console.log(
      `Score margin: ${scoreMargin ?? "N/A"}`,
    );

    candidates.forEach(
      (
        candidate,
        index,
      ) => {
        const edition =
          candidate.book.editions.find(
            (item) =>
              item.isCurrentEdition
              && item.isActive,
          )
          ?? candidate.book.editions.find(
            (item) =>
              item.isActive,
          )
          ?? candidate.book.editions[0];

        console.log("");
        console.log(
          `Candidate ${index + 1}`,
        );
        console.log(
          `Book: ${candidate.book.entity.canonicalName}`,
        );
        console.log(
          `Book ID: ${candidate.book.id}`,
        );
        console.log(
          `Book entity ID: ${candidate.book.entityId}`,
        );
        console.log(
          `Score: ${candidate.score}`,
        );
        console.log(
          `Match method: ${candidate.matchMethod}`,
        );
        console.log(
          `Edition ID: ${edition?.id ?? "NONE"}`,
        );
        console.log(
          `Current edition: ${edition?.isCurrentEdition ?? false}`,
        );
        console.log(
          `Active edition: ${edition?.isActive ?? false}`,
        );

        if (
          candidate.scoreBreakdown
        ) {
          console.log(
            "Score breakdown:",
            candidate.scoreBreakdown,
          );
        }

        console.log(
          `Subjects: ${
            candidate.book.subjects
              .map(
                (
                  relationship,
                ) =>
                  relationship
                    .subject
                    .entity
                    .canonicalName,
              )
              .join(
                ", ",
              )
            || "NONE"
          }`,
        );

        console.log(
          `Levels: ${
            candidate.book.levels
              .map(
                (
                  relationship,
                ) =>
                  relationship
                    .level
                    .entity
                    .canonicalName,
              )
              .join(
                ", ",
              )
            || "NONE"
          }`,
        );

        console.log(
          `Publisher: ${
            candidate.book
              .bookLine
              .publisher
              .entity
              .canonicalName
          }`,
        );
      },
    );
  }

  console.log("");
  console.log(
    "================================================",
  );
  console.log(
    "Golden History Product-to-EKB preview completed.",
  );
  console.log(
    "No Product or ProductFingerprint records were changed.",
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
            Boolean(
              value,
            ),
        ),
    ),
  ).join(
    " ",
  );
}

main()
  .catch(
    (
      error:
        unknown,
    ) => {
      console.error("");
      console.error(
        "Golden History Product-to-EKB preview failed.",
      );
      console.error(
        error,
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