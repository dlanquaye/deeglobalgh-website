import {
  prisma,
} from "../lib/prisma";

import {
  BookPublicationExecutor,
} from "../lib/ekb/sync/execution/BookPublicationExecutor";

interface BackfillSummary {
  totalBooks: number;

  alreadyHadEdition: number;

  createdEdition: number;

  failed: number;
}

async function main(): Promise<void> {
  console.log(
    "Backfilling Educational Edition records...",
  );

  const books =
    await prisma.educationalBook.findMany({
      include: {
        entity: true,

        editions: {
          select: {
            id: true,
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  const summary: BackfillSummary = {
    totalBooks: books.length,

    alreadyHadEdition: 0,

    createdEdition: 0,

    failed: 0,
  };

  const executor =
    new BookPublicationExecutor(
      prisma,
    );

  console.log("");
  console.log(
    `Educational Books found: ${books.length}`,
  );

  for (
    let index = 0;
    index < books.length;
    index++
  ) {
    const book =
      books[index];

    const position =
      index + 1;

    console.log("");
    console.log(
      `[${position}/${books.length}] ${book.entity.canonicalName}`,
    );

    if (
      book.editions.length > 0
    ) {
      summary.alreadyHadEdition++;

      console.log(
        "SKIPPED: Book already has an Edition.",
      );

      continue;
    }

    try {
      await executor.execute({
        bookId: book.id,

        bookTitle:
          book.entity.canonicalName,
      });

      const editionCount =
        await prisma.educationalEdition.count({
          where: {
            bookId: book.id,
          },
        });

      if (editionCount < 1) {
        throw new Error(
          "Edition execution completed, but no Edition record was found.",
        );
      }

      summary.createdEdition++;

      console.log(
        "CREATED: Current Edition.",
      );
    } catch (error: unknown) {
      summary.failed++;

      console.error(
        "FAILED:",
        error,
      );
    }
  }

  const [
    finalEditionCount,
    booksWithEditions,
    booksWithoutEditions,
  ] = await Promise.all([
    prisma.educationalEdition.count(),

    prisma.educationalBook.count({
      where: {
        editions: {
          some: {},
        },
      },
    }),

    prisma.educationalBook.count({
      where: {
        editions: {
          none: {},
        },
      },
    }),
  ]);

  console.log("");
  console.log("========================================");
  console.log("Educational Edition backfill summary");
  console.log("----------------------------------------");
  console.log(
    `Books inspected: ${summary.totalBooks}`,
  );
  console.log(
    `Books already containing an Edition: ${summary.alreadyHadEdition}`,
  );
  console.log(
    `Editions created: ${summary.createdEdition}`,
  );
  console.log(
    `Failures: ${summary.failed}`,
  );
  console.log(
    `Final Educational Edition count: ${finalEditionCount}`,
  );
  console.log(
    `Books with Editions: ${booksWithEditions}`,
  );
  console.log(
    `Books without Editions: ${booksWithoutEditions}`,
  );

  if (summary.failed > 0) {
    throw new Error(
      `${summary.failed} Educational Edition backfill operation(s) failed.`,
    );
  }

  if (booksWithoutEditions > 0) {
    throw new Error(
      `${booksWithoutEditions} Educational Book record(s) still have no Edition.`,
    );
  }

  if (
    booksWithEditions
    !== summary.totalBooks
  ) {
    throw new Error(
      "The final number of books with Editions does not match the total Educational Book count.",
    );
  }

  console.log("");
  console.log(
    "Educational Edition backfill completed successfully.",
  );
}

main()
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "Educational Edition backfill failed.",
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