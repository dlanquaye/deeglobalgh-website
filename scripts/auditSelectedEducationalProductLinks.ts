import {
  prisma,
} from "../lib/prisma";

const TARGET_SKUS = [
  "DG-B1-MTH-BB-024",
  "DG-B1-SCI-BB-031",
  "DG-B1-ENG-ESS-052",
  "DG-B1-MTH-GLD-107",
];

async function main(): Promise<void> {
  console.log(
    "Auditing selected Product-to-EKB links...",
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
        educationalEntityId: true,
        educationalEditionId: true,
        classificationConfidence: true,
        educationalVerified: true,
        educationalLastSyncedAt: true,

        educationalEdition: {
          select: {
            id: true,
            editionName: true,
            isCurrentEdition: true,
            isPublished: true,
            isActive: true,

            book: {
              select: {
                id: true,
                entityId: true,

                entity: {
                  select: {
                    canonicalName: true,
                  },
                },
              },
            },
          },
        },

        fingerprint: {
          select: {
            educationalEntityId: true,
            educationalEditionId: true,
          },
        },
      },

      orderBy: {
        name: "asc",
      },
    });

  if (
    products.length
    !== TARGET_SKUS.length
  ) {
    throw new Error(
      `Expected ${TARGET_SKUS.length} selected Products, found ${products.length}.`,
    );
  }

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
    console.log(
      `Product entity link: ${product.educationalEntityId ?? "NONE"}`,
    );
    console.log(
      `Product edition link: ${product.educationalEditionId ?? "NONE"}`,
    );
    console.log(
      `Classification confidence: ${product.classificationConfidence ?? "NONE"}`,
    );
    console.log(
      `Educational verified: ${product.educationalVerified}`,
    );
    console.log(
      `Last synced: ${product.educationalLastSyncedAt?.toISOString() ?? "NONE"}`,
    );
    console.log(
      `Fingerprint entity link: ${product.fingerprint?.educationalEntityId ?? "NONE"}`,
    );
    console.log(
      `Fingerprint edition link: ${product.fingerprint?.educationalEditionId ?? "NONE"}`,
    );
    console.log(
      `Linked book: ${product.educationalEdition?.book.entity.canonicalName ?? "NONE"}`,
    );

    if (
      !product.educationalEntityId
      || !product.educationalEditionId
    ) {
      throw new Error(
        `Product ${product.sku} is missing a direct EKB link.`,
      );
    }

    if (!product.educationalEdition) {
      throw new Error(
        `Product ${product.sku} points to a missing Educational Edition.`,
      );
    }

    if (
      product.educationalEntityId
      !== product.educationalEdition.book.entityId
    ) {
      throw new Error(
        `Product ${product.sku} has inconsistent Book and Edition links.`,
      );
    }

    if (
      !product.educationalEdition.isCurrentEdition
      || !product.educationalEdition.isPublished
      || !product.educationalEdition.isActive
    ) {
      throw new Error(
        `Product ${product.sku} is linked to an invalid Edition lifecycle state.`,
      );
    }

    if (
      !product.educationalVerified
    ) {
      throw new Error(
        `Product ${product.sku} was not marked as educationally verified.`,
      );
    }

    if (
      product.classificationConfidence
      === null
      || product.classificationConfidence
      < 55
    ) {
      throw new Error(
        `Product ${product.sku} has an invalid classification confidence.`,
      );
    }

    if (product.fingerprint) {
      if (
        product.fingerprint.educationalEntityId
        !== product.educationalEntityId
      ) {
        throw new Error(
          `Product ${product.sku} and its fingerprint have different entity links.`,
        );
      }

      if (
        product.fingerprint.educationalEditionId
        !== product.educationalEditionId
      ) {
        throw new Error(
          `Product ${product.sku} and its fingerprint have different edition links.`,
        );
      }
    }

    console.log(
      "PASSED: Product and fingerprint links are consistent.",
    );
  }

  const [
    linkedProducts,
    linkedFingerprints,
  ] = await Promise.all([
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
  console.log(
    "Selected-link audit summary",
  );
  console.log(
    "---------------------------",
  );
  console.log(
    `Products linked to Editions: ${linkedProducts}`,
  );
  console.log(
    `Fingerprints linked to Editions: ${linkedFingerprints}`,
  );

  if (linkedProducts < 4) {
    throw new Error(
      "Fewer than four Products are linked to Educational Editions.",
    );
  }

  console.log("");
  console.log(
    "Selected Product-to-EKB link audit completed successfully.",
  );
}

main()
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "Selected Product-to-EKB link audit failed.",
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