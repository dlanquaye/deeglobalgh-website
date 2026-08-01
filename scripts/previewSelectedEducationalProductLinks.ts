import {
  prisma,
} from "../lib/prisma";

import {
  EducationalBookSearchService,
} from "../lib/ekb/search/EducationalBookSearchService";

import {
  BookReadService,
} from "../lib/ekb/services/BookReadService";

const TARGET_SKUS = [
  "DG-B1-ENG-BB-017",
  "DG-B1-MTH-BB-024",
  "DG-B1-SCI-BB-031",
  "DG-B4-MTH-GOL-000",
  "DG-B1-ENG-ESS-052",
];

async function main(): Promise<void> {
  console.log(
    "Previewing selected Product-to-EKB relationships...",
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
        OR: [
          {
            sku: {
              in: TARGET_SKUS,
            },
          },
          {
            name: {
              contains:
                "Golden Mathematics Textbook for Basic 4",

              mode: "insensitive",
            },
          },
        ],
      },

      select: {
        id: true,
        sku: true,
        name: true,
        publisher: true,
        author: true,
        levelSlugs: true,
      },

      orderBy: {
        name: "asc",
      },
    });

  if (products.length === 0) {
    throw new Error(
      "None of the selected test Products could be found.",
    );
  }

  console.log("");
  console.log(
    `Selected Products found: ${products.length}`,
  );

  for (const product of products) {
    const query =
      buildSearchQuery(product);

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
          `Score: ${candidate.score}`,
        );
        console.log(
          `Match method: ${candidate.matchMethod}`,
        );
        console.log(
          `Edition ID: ${edition?.id ?? "NONE"}`,
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
                (relationship) =>
                  relationship.subject
                    .entity.canonicalName,
              )
              .join(", ")
            || "NONE"
          }`,
        );

        console.log(
          `Levels: ${
            candidate.book.levels
              .map(
                (relationship) =>
                  relationship.level
                    .entity.canonicalName,
              )
              .join(", ")
            || "NONE"
          }`,
        );

        console.log(
          `Publisher: ${
            candidate.book.bookLine
              .publisher.entity
              .canonicalName
          }`,
        );
      },
    );
  }

  console.log("");
  console.log(
    "Selected Product-to-EKB preview completed.",
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

main()
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "Selected Product-to-EKB preview failed.",
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