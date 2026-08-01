import { prisma } from "../lib/prisma";

import {
  BookReadService,
} from "../lib/ekb/services/BookReadService";

import {
  EducationalBookSearchService,
} from "../lib/ekb/search/EducationalBookSearchService";

interface PreviewSummary {
  totalProducts: number;
  productsWithCandidates: number;
  productsWithoutCandidates: number;
  highConfidenceCandidates: number;
  reviewCandidates: number;
}

const HIGH_CONFIDENCE_SCORE = 55;
const REVIEW_SCORE = 30;
const PREVIEW_LIMIT = 50;

async function main(): Promise<void> {
  console.log(
    "Previewing Product-to-EKB relationships...",
  );

  const bookReadService =
    new BookReadService(prisma);

  const educationalBookSearchService =
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
        categorySlug: true,
        levelSlugs: true,

        fingerprint: {
          select: {
            educationalEntityId: true,
            educationalEditionId: true,
          },
        },
      },

      orderBy: [
        {
          name: "asc",
        },
        {
          sku: "asc",
        },
      ],

      take: PREVIEW_LIMIT,
    });

  const summary: PreviewSummary = {
    totalProducts: products.length,
    productsWithCandidates: 0,
    productsWithoutCandidates: 0,
    highConfidenceCandidates: 0,
    reviewCandidates: 0,
  };

  console.log("");
  console.log(
    `Previewing first ${products.length} active unlinked Products.`,
  );

  for (const product of products) {
    const searchQuery =
      buildSearchQuery(product);

    const candidates =
      await educationalBookSearchService.search({
        query: searchQuery,
        limit: 3,
      });

    console.log("");
    console.log("================================================");
    console.log(`Product: ${product.name}`);
    console.log(`SKU: ${product.sku}`);
    console.log(`Search query: ${searchQuery}`);

    if (candidates.length === 0) {
      summary.productsWithoutCandidates++;

      console.log("Candidate status: NONE");
      console.log(
        "No EKB book candidate was found.",
      );

      continue;
    }

    summary.productsWithCandidates++;

    const bestCandidate =
      candidates[0];

    const classification =
      classifyScore(
        bestCandidate.score,
      );

    if (
      classification ===
      "HIGH_CONFIDENCE"
    ) {
      summary.highConfidenceCandidates++;
    } else {
      summary.reviewCandidates++;
    }

    console.log(
      `Candidate status: ${classification}`,
    );

    candidates.forEach(
      (candidate, index) => {
        const currentEdition =
          candidate.book.editions.find(
            (edition) =>
              edition.isCurrentEdition &&
              edition.isActive,
          ) ??
          candidate.book.editions.find(
            (edition) =>
              edition.isActive,
          ) ??
          candidate.book.editions[0];

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
          `Edition ID: ${currentEdition?.id ?? "NONE"}`,
        );
        console.log(
          `Current edition: ${currentEdition?.isCurrentEdition ?? false}`,
        );
        console.log(
          `Active edition: ${currentEdition?.isActive ?? false}`,
        );
      },
    );
  }

  console.log("");
  console.log("================================================");
  console.log("Preview summary");
  console.log("---------------");
  console.log(
    `Products inspected: ${summary.totalProducts}`,
  );
  console.log(
    `Products with candidates: ${summary.productsWithCandidates}`,
  );
  console.log(
    `Products without candidates: ${summary.productsWithoutCandidates}`,
  );
  console.log(
    `High-confidence candidates: ${summary.highConfidenceCandidates}`,
  );
  console.log(
    `Candidates requiring review: ${summary.reviewCandidates}`,
  );

  console.log("");
  console.log(
    "No Product or fingerprint records were changed.",
  );
  console.log(
    "Product-to-EKB relationship preview completed.",
  );
}

function buildSearchQuery(product: {
  name: string;
  publisher: string | null;
  author: string | null;
  levelSlugs: string[];
}): string {
  const components = [
    product.name,
    product.publisher,
    product.author,
    ...product.levelSlugs,
  ];

  return Array.from(
    new Set(
      components
        .map((component) =>
          component?.trim(),
        )
        .filter(
          (
            component,
          ): component is string =>
            Boolean(component),
        ),
    ),
  ).join(" ");
}

function classifyScore(
  score: number,
):
  | "HIGH_CONFIDENCE"
  | "REVIEW"
  | "LOW_CONFIDENCE" {
  if (
    score >= HIGH_CONFIDENCE_SCORE
  ) {
    return "HIGH_CONFIDENCE";
  }

  if (score >= REVIEW_SCORE) {
    return "REVIEW";
  }

  return "LOW_CONFIDENCE";
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error(
      "Product-to-EKB relationship preview failed.",
    );
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });