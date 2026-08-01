import {
  prisma,
} from "../lib/prisma";

import {
  BookPublicationExecutor,
} from "../lib/ekb/sync/execution/BookPublicationExecutor";

async function main(): Promise<void> {
  console.log(
    "Testing BookPublicationExecutor...",
  );

  const book =
    await prisma.educationalBook.findFirst({
      include: {
        entity: true,

        editions: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  if (!book) {
    throw new Error(
      "No Educational Book exists for the controlled publication test.",
    );
  }

  console.log("");
  console.log("Reference book");
  console.log("--------------");
  console.log(
    `Book: ${book.entity.canonicalName}`,
  );
  console.log(
    `Book ID: ${book.id}`,
  );
  console.log(
    `Existing Editions: ${book.editions.length}`,
  );

  const executor =
    new BookPublicationExecutor(
      prisma,
    );

  await executor.execute({
    bookId: book.id,

    bookTitle:
      book.entity.canonicalName,
  });

  const afterFirstExecution =
    await prisma.educationalBook.findUnique({
      where: {
        id: book.id,
      },

      include: {
        editions: {
          include: {
            entity: true,

            isbns: true,
          },
        },
      },
    });

  if (!afterFirstExecution) {
    throw new Error(
      "The reference Educational Book could not be reloaded after publication execution.",
    );
  }

  if (
    afterFirstExecution.editions.length
    !== 1
  ) {
    throw new Error(
      `Expected exactly 1 Edition after first execution, found ${afterFirstExecution.editions.length}.`,
    );
  }

  const firstEdition =
    afterFirstExecution.editions[0];

  console.log("");
  console.log("After first execution");
  console.log("---------------------");
  console.log(
    `Edition ID: ${firstEdition.id}`,
  );
  console.log(
    `Edition name: ${firstEdition.editionName}`,
  );
  console.log(
    `Current: ${firstEdition.isCurrentEdition}`,
  );
  console.log(
    `Published: ${firstEdition.isPublished}`,
  );
  console.log(
    `Active: ${firstEdition.isActive}`,
  );
  console.log(
    `ISBN records: ${firstEdition.isbns.length}`,
  );

  if (
    firstEdition.editionName
    !== "Current Edition"
  ) {
    throw new Error(
      "The controlled Edition does not have the expected edition name.",
    );
  }

  if (
    !firstEdition.isCurrentEdition
    || !firstEdition.isPublished
    || !firstEdition.isActive
  ) {
    throw new Error(
      "The controlled Edition does not have the required lifecycle flags.",
    );
  }

  if (
    firstEdition.isbns.length !== 0
  ) {
    throw new Error(
      "An ISBN record was created even though no ISBN was supplied.",
    );
  }

  await executor.execute({
    bookId: book.id,

    bookTitle:
      book.entity.canonicalName,
  });

  const afterSecondExecution =
    await prisma.educationalBook.findUnique({
      where: {
        id: book.id,
      },

      include: {
        editions: true,
      },
    });

  if (!afterSecondExecution) {
    throw new Error(
      "The reference Educational Book could not be reloaded after the second execution.",
    );
  }

  if (
    afterSecondExecution.editions.length
    !== 1
  ) {
    throw new Error(
      `Idempotency failed. Expected 1 Edition after second execution, found ${afterSecondExecution.editions.length}.`,
    );
  }

  console.log("");
  console.log(
    "PASSED: Edition created without ISBN",
  );
  console.log(
    "PASSED: Edition lifecycle flags",
  );
  console.log(
    "PASSED: No ISBN created when omitted",
  );
  console.log(
    "PASSED: Second execution remained idempotent",
  );

  console.log("");
  console.log(
    "BookPublicationExecutor verification completed successfully.",
  );
}

main()
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "BookPublicationExecutor verification failed.",
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