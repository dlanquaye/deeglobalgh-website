import {
  prisma,
} from "../lib/prisma";

async function main(): Promise<void> {
  console.log(
    "Auditing Educational Edition records...",
  );

  const [
    totalBooks,
    totalEditions,
    booksWithEditions,
    booksWithoutEditions,
    activeEditions,
    currentEditions,
    publishedEditions,
    productsLinkedToEditions,
    fingerprintsLinkedToEditions,
  ] = await Promise.all([
    prisma.educationalBook.count(),

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

    prisma.educationalEdition.count({
      where: {
        isActive: true,
      },
    }),

    prisma.educationalEdition.count({
      where: {
        isCurrentEdition: true,
      },
    }),

    prisma.educationalEdition.count({
      where: {
        isPublished: true,
      },
    }),

    prisma.product.count({
      where: {
        educationalEditionId: {
          not: null,
        },
      },
    }),

    prisma.productFingerprint.count({
      where: {
        educationalEditionId: {
          not: null,
        },
      },
    }),
  ]);

  console.log("");
  console.log("Edition audit summary");
  console.log("---------------------");
  console.log(
    `Educational Books: ${totalBooks}`,
  );
  console.log(
    `Educational Editions: ${totalEditions}`,
  );
  console.log(
    `Books with Editions: ${booksWithEditions}`,
  );
  console.log(
    `Books without Editions: ${booksWithoutEditions}`,
  );
  console.log(
    `Active Editions: ${activeEditions}`,
  );
  console.log(
    `Current Editions: ${currentEditions}`,
  );
  console.log(
    `Published Editions: ${publishedEditions}`,
  );
  console.log(
    `Products linked to Editions: ${productsLinkedToEditions}`,
  );
  console.log(
    `Product Fingerprints linked to Editions: ${fingerprintsLinkedToEditions}`,
  );

  const editionSamples =
    await prisma.educationalEdition.findMany({
      select: {
        id: true,

        editionNumber: true,

        editionName: true,

        publicationYear: true,

        revision: true,

        isCurrentEdition: true,

        isPublished: true,

        isActive: true,

        entity: {
          select: {
            code: true,

            canonicalName: true,
          },
        },

        book: {
          select: {
            id: true,

            entity: {
              select: {
                canonicalName: true,
              },
            },
          },
        },

        products: {
          select: {
            id: true,

            sku: true,

            name: true,
          },

          take: 5,
        },
      },

      orderBy: {
        createdAt: "asc",
      },

      take: 20,
    });

  console.log("");
  console.log("Edition samples");
  console.log("---------------");

  if (
    editionSamples.length === 0
  ) {
    console.log(
      "No Educational Edition records exist.",
    );
  } else {
    for (
      const edition
      of editionSamples
    ) {
      console.log("");
      console.log(
        `Edition ID: ${edition.id}`,
      );
      console.log(
        `Edition entity: ${edition.entity.canonicalName}`,
      );
      console.log(
        `Edition code: ${edition.entity.code}`,
      );
      console.log(
        `Book: ${edition.book.entity.canonicalName}`,
      );
      console.log(
        `Edition number: ${edition.editionNumber ?? "NONE"}`,
      );
      console.log(
        `Edition name: ${edition.editionName ?? "NONE"}`,
      );
      console.log(
        `Publication year: ${edition.publicationYear ?? "NONE"}`,
      );
      console.log(
        `Revision: ${edition.revision ?? "NONE"}`,
      );
      console.log(
        `Current: ${edition.isCurrentEdition}`,
      );
      console.log(
        `Published: ${edition.isPublished}`,
      );
      console.log(
        `Active: ${edition.isActive}`,
      );
      console.log(
        `Linked Products: ${edition.products.length}`,
      );

      for (
        const product
        of edition.products
      ) {
        console.log(
          `  - ${product.sku}: ${product.name}`,
        );
      }
    }
  }

  const booksWithoutEditionSamples =
    await prisma.educationalBook.findMany({
      where: {
        editions: {
          none: {},
        },
      },

      select: {
        id: true,

        entityId: true,

        entity: {
          select: {
            code: true,

            canonicalName: true,
          },
        },

        bookLine: {
          select: {
            entity: {
              select: {
                canonicalName: true,
              },
            },

            publisher: {
              select: {
                entity: {
                  select: {
                    canonicalName: true,
                  },
                },
              },
            },
          },
        },

        subjects: {
          select: {
            subject: {
              select: {
                entity: {
                  select: {
                    canonicalName: true,
                  },
                },
              },
            },
          },

          take: 5,
        },

        levels: {
          select: {
            level: {
              select: {
                entity: {
                  select: {
                    canonicalName: true,
                  },
                },
              },
            },
          },

          take: 10,
        },
      },

      orderBy: {
        createdAt: "asc",
      },

      take: 20,
    });

  console.log("");
  console.log(
    "Books without Edition samples",
  );
  console.log(
    "-----------------------------",
  );

  if (
    booksWithoutEditionSamples.length
    === 0
  ) {
    console.log(
      "Every Educational Book has at least one Edition.",
    );
  } else {
    for (
      const book
      of booksWithoutEditionSamples
    ) {
      console.log("");
      console.log(
        `Book: ${book.entity.canonicalName}`,
      );
      console.log(
        `Book ID: ${book.id}`,
      );
      console.log(
        `Book entity ID: ${book.entityId}`,
      );
      console.log(
        `Book code: ${book.entity.code}`,
      );
      console.log(
        `Book line: ${book.bookLine.entity.canonicalName}`,
      );
      console.log(
        `Publisher: ${book.bookLine.publisher.entity.canonicalName}`,
      );
      console.log(
        `Subjects: ${
          book.subjects
            .map(
              (relationship) =>
                relationship.subject.entity.canonicalName,
            )
            .join(", ")
          || "NONE"
        }`,
      );
      console.log(
        `Levels: ${
          book.levels
            .map(
              (relationship) =>
                relationship.level.entity.canonicalName,
            )
            .join(", ")
          || "NONE"
        }`,
      );
    }
  }

  console.log("");
  console.log(
    "Educational Edition audit completed.",
  );
}

main()
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "Educational Edition audit failed.",
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