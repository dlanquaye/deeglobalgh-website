import {
  prisma,
} from "../lib/prisma";

import {
  EducationalBookSearchService,
  EducationalBookSearchResult,
} from "../lib/ekb/search/EducationalBookSearchService";

import {
  BookReadService,
} from "../lib/ekb/services/BookReadService";

const BATCH_SIZE = 25;

const MINIMUM_SCORE = 55;

const MINIMUM_MARGIN = 15;

interface PreviewSummary {
  inspected: number;

  eligible: number;

  noCandidate: number;

  lowConfidence: number;

  smallMargin: number;

  missingEdition: number;
}

async function main(): Promise<void> {
  console.log(
    "Previewing eligible Product-to-EKB links...",
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
        isActive: true,

        educationalEntityId: null,

        educationalEditionId: null,
      },

      select: {
        id: true,

        sku: true,

        name: true,

        publisher: true,

        author: true,

        levelSlugs: true,
      },

      orderBy: [
        {
          name: "asc",
        },

        {
          sku: "asc",
        },
      ],

      take: BATCH_SIZE,
    });

  const summary: PreviewSummary = {
    inspected: products.length,

    eligible: 0,

    noCandidate: 0,

    lowConfidence: 0,

    smallMargin: 0,

    missingEdition: 0,
  };

  console.log("");
  console.log(
    `Unlinked Products inspected: ${products.length}`,
  );
  console.log(
    `Minimum score: ${MINIMUM_SCORE}`,
  );
  console.log(
    `Minimum margin: ${MINIMUM_MARGIN}`,
  );

  for (
    let index = 0;
    index < products.length;
    index++
  ) {
    const product =
      products[index];

    console.log("");
    console.log(
      `[${index + 1}/${products.length}] ${product.name}`,
    );

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
        "NOT ELIGIBLE: No candidate.",
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

    if (
      bestCandidate.score
      < MINIMUM_SCORE
    ) {
      summary.lowConfidence++;

      console.log(
        `NOT ELIGIBLE: Score ${bestCandidate.score} is below ${MINIMUM_SCORE}.`,
      );

      continue;
    }

    if (
      scoreMargin
      < MINIMUM_MARGIN
    ) {
      summary.smallMargin++;

      console.log(
        `NOT ELIGIBLE: Margin ${scoreMargin} is below ${MINIMUM_MARGIN}.`,
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
        "NOT ELIGIBLE: No active current Edition.",
      );

      continue;
    }

    summary.eligible++;

    console.log(
      "ELIGIBLE",
    );
    console.log(
      `SKU: ${product.sku}`,
    );
    console.log(
      `Product: ${product.name}`,
    );
    console.log(
      `Book: ${bestCandidate.book.entity.canonicalName}`,
    );
    console.log(
      `Book entity ID: ${bestCandidate.book.entityId}`,
    );
    console.log(
      `Edition ID: ${edition.id}`,
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
      bestCandidate.scoreBreakdown
    ) {
      console.log(
        "Score breakdown:",
        bestCandidate.scoreBreakdown,
      );
    }
  }

  console.log("");
  console.log(
    "================================================",
  );
  console.log(
    "Eligible-link preview summary",
  );
  console.log(
    "-----------------------------",
  );
  console.log(
    `Products inspected: ${summary.inspected}`,
  );
  console.log(
    `Eligible for linking: ${summary.eligible}`,
  );
  console.log(
    `No candidate: ${summary.noCandidate}`,
  );
  console.log(
    `Low confidence: ${summary.lowConfidence}`,
  );
  console.log(
    `Small score margin: ${summary.smallMargin}`,
  );
  console.log(
    `Missing active Edition: ${summary.missingEdition}`,
  );

  console.log("");
  console.log(
    "No Product or fingerprint records were changed.",
  );
  console.log(
    "Eligible Product-to-EKB link preview completed.",
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
        "Eligible Product-to-EKB link preview failed.",
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