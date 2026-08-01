import { prisma } from "../lib/prisma";

async function main(): Promise<void> {
  console.log(
    "Inspecting Product-to-EKB relationships...",
  );

  const [
    totalProducts,
    activeProducts,
    productsWithEducationalEntity,
    productsWithEducationalEdition,
    fingerprintsWithEducationalEntity,
    fingerprintsWithEducationalEdition,
    productsWithAnyEducationalLink,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.product.count({
      where: {
        isActive: true,
      },
    }),

    prisma.product.count({
      where: {
        educationalEntityId: {
          not: null,
        },
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
        educationalEntityId: {
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

    prisma.product.count({
      where: {
        OR: [
          {
            educationalEntityId: {
              not: null,
            },
          },
          {
            educationalEditionId: {
              not: null,
            },
          },
          {
            fingerprint: {
              is: {
                OR: [
                  {
                    educationalEntityId: {
                      not: null,
                    },
                  },
                  {
                    educationalEditionId: {
                      not: null,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  ]);

  console.log("");
  console.log("Product counts");
  console.log("--------------");
  console.log(`Total Products: ${totalProducts}`);
  console.log(`Active Products: ${activeProducts}`);
  console.log(
    `Products with educationalEntityId: ${productsWithEducationalEntity}`,
  );
  console.log(
    `Products with educationalEditionId: ${productsWithEducationalEdition}`,
  );
  console.log(
    `Fingerprints with educationalEntityId: ${fingerprintsWithEducationalEntity}`,
  );
  console.log(
    `Fingerprints with educationalEditionId: ${fingerprintsWithEducationalEdition}`,
  );
  console.log(
    `Products with any EKB relationship: ${productsWithAnyEducationalLink}`,
  );

  const linkedProducts =
    await prisma.product.findMany({
      where: {
        OR: [
          {
            educationalEntityId: {
              not: null,
            },
          },
          {
            educationalEditionId: {
              not: null,
            },
          },
          {
            fingerprint: {
              is: {
                OR: [
                  {
                    educationalEntityId: {
                      not: null,
                    },
                  },
                  {
                    educationalEditionId: {
                      not: null,
                    },
                  },
                ],
              },
            },
          },
        ],
      },

      select: {
        id: true,
        sku: true,
        name: true,
        educationalEntityId: true,
        educationalEditionId: true,

        fingerprint: {
          select: {
            educationalEntityId: true,
            educationalEditionId: true,
          },
        },

        educationalEdition: {
          select: {
            id: true,

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
          },
        },
      },

      orderBy: {
        name: "asc",
      },

      take: 20,
    });

  console.log("");
  console.log("Linked Product samples");
  console.log("----------------------");

  if (linkedProducts.length === 0) {
    console.log(
      "No Product currently has a direct or fingerprint EKB relationship.",
    );
  } else {
    for (const product of linkedProducts) {
      console.log("");
      console.log(`Product: ${product.name}`);
      console.log(`SKU: ${product.sku}`);
      console.log(
        `Product educationalEntityId: ${product.educationalEntityId ?? "NONE"}`,
      );
      console.log(
        `Product educationalEditionId: ${product.educationalEditionId ?? "NONE"}`,
      );
      console.log(
        `Fingerprint educationalEntityId: ${product.fingerprint?.educationalEntityId ?? "NONE"}`,
      );
      console.log(
        `Fingerprint educationalEditionId: ${product.fingerprint?.educationalEditionId ?? "NONE"}`,
      );
      console.log(
        `Linked EKB book: ${product.educationalEdition?.book.entity.canonicalName ?? "NONE"}`,
      );
    }
  }

  console.log("");
  console.log(
    "Product-to-EKB relationship inspection completed.",
  );
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error(
      "Product-to-EKB relationship inspection failed.",
    );
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });