import {
  PrismaClient,
} from "@prisma/client";

const prisma =
  new PrismaClient();

interface EssentialSkuCorrection {
  id: string;

  productName: string;

  currentSku: string;

  correctedSku: string;
}

interface PreparedSkuCorrection {
  correction:
    EssentialSkuCorrection;

  status:
    | "READY"
    | "ALREADY_CORRECT";
}

const SKU_CORRECTIONS:
  EssentialSkuCorrection[] = [
    {
      id:
        "cmoxfzuzw001kg3in83jpdynj",

      productName:
        "Essential English Textbook For Basic 6",

      currentSku:
        " DG-B6-ENG-ESS-057",

      correctedSku:
        "DG-B6-ENG-ESS-057",
    },

    {
      id:
        "cmoxfzvft001ng3inzqfb6una",

      productName:
        "Essential Science Textbook For Basic 3",

      currentSku:
        " DG-B3-SCI-ESS-060",

      correctedSku:
        "DG-B3-SCI-ESS-060",
    },
  ];

function normalizeValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("en")
    .replace(/\s+/g, " ");
}

async function prepareCorrections():
  Promise<
    PreparedSkuCorrection[]
  > {
  const preparedCorrections:
    PreparedSkuCorrection[] = [];

  for (
    const correction
    of SKU_CORRECTIONS
  ) {
    const product =
      await prisma.product.findUnique({
        where: {
          id:
            correction.id,
        },

        select: {
          id: true,

          name: true,

          sku: true,
        },
      });

    if (!product) {
      throw new Error(
        `Product ${correction.id} could not be found.`,
      );
    }

    if (
      normalizeValue(product.name)
      !== normalizeValue(
        correction.productName,
      )
    ) {
      throw new Error(
        [
          `Product name verification failed for ${correction.id}.`,
          `Expected: ${correction.productName}.`,
          `Actual: ${product.name}.`,
        ].join(" "),
      );
    }

    if (
      product.sku
      === correction.correctedSku
    ) {
      preparedCorrections.push({
        correction,

        status:
          "ALREADY_CORRECT",
      });

      console.log(
        [
          "ALREADY CORRECT",
          correction.correctedSku,
          product.name,
        ].join(" | "),
      );

      continue;
    }

    if (
      product.sku
      !== correction.currentSku
    ) {
      throw new Error(
        [
          `Stored SKU verification failed for ${correction.id}.`,
          `Expected current value: ${JSON.stringify(correction.currentSku)}.`,
          `Actual value: ${JSON.stringify(product.sku)}.`,
        ].join(" "),
      );
    }

    const conflictingProduct =
      await prisma.product.findFirst({
        where: {
          sku:
            correction.correctedSku,

          id: {
            not:
              correction.id,
          },
        },

        select: {
          id: true,

          name: true,

          sku: true,
        },
      });

    if (conflictingProduct) {
      throw new Error(
        [
          `The corrected SKU ${correction.correctedSku} is already used by another Product.`,
          `Product ID: ${conflictingProduct.id}.`,
          `Product name: ${conflictingProduct.name}.`,
        ].join(" "),
      );
    }

    preparedCorrections.push({
      correction,

      status:
        "READY",
    });

    console.log(
      [
        "APPROVED FOR CORRECTION",
        JSON.stringify(
          correction.currentSku,
        ),
        "->",
        correction.correctedSku,
        product.name,
      ].join(" | "),
    );
  }

  return preparedCorrections;
}

async function main():
  Promise<void> {
  console.log(
    "Essential Product SKU Correction",
  );
  console.log(
    "================================",
  );
  console.log(
    `Approved Products: ${SKU_CORRECTIONS.length}`,
  );
  console.log(
    "Mode: CONTROLLED WRITE — two verified SKUs only",
  );
  console.log("");
  console.log(
    "Running complete preflight verification...",
  );
  console.log("");

  const preparedCorrections =
    await prepareCorrections();

  console.log("");
  console.log(
    "Preflight verification passed.",
  );
  console.log(
    "Beginning controlled SKU correction...",
  );

  const correctedProducts =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        const corrected:
          EssentialSkuCorrection[] = [];

        for (
          const prepared
          of preparedCorrections
        ) {
          if (
            prepared.status
            === "ALREADY_CORRECT"
          ) {
            continue;
          }

          const correction =
            prepared.correction;

          const updateResult =
            await transaction.product.updateMany({
              where: {
                id:
                  correction.id,

                sku:
                  correction.currentSku,
              },

              data: {
                sku:
                  correction.correctedSku,
              },
            });

          if (
            updateResult.count
            !== 1
          ) {
            throw new Error(
              [
                `SKU correction failed for Product ${correction.id}.`,
                "The Product may have changed after preflight verification.",
              ].join(" "),
            );
          }

          const verifiedProduct =
            await transaction.product.findUnique({
              where: {
                id:
                  correction.id,
              },

              select: {
                name: true,

                sku: true,
              },
            });

          if (
            !verifiedProduct
            || verifiedProduct.sku
              !== correction.correctedSku
          ) {
            throw new Error(
              `Post-write verification failed for ${correction.correctedSku}.`,
            );
          }

          corrected.push(
            correction,
          );
        }

        return corrected;
      },
    );

  console.log("");

  for (
    const correction
    of correctedProducts
  ) {
    console.log(
      [
        "CORRECTED",
        correction.correctedSku,
        correction.productName,
      ].join(" | "),
    );
  }

  for (
    const prepared
    of preparedCorrections
  ) {
    if (
      prepared.status
      === "ALREADY_CORRECT"
    ) {
      console.log(
        [
          "SKIPPED",
          prepared.correction.correctedSku,
          "SKU was already correct.",
        ].join(" | "),
      );
    }
  }

  const alreadyCorrect =
    preparedCorrections.filter(
      (prepared) =>
        prepared.status
        === "ALREADY_CORRECT",
    ).length;

  console.log("");
  console.log(
    "SKU correction summary",
  );
  console.log(
    "----------------------",
  );
  console.log(
    `Approved: ${SKU_CORRECTIONS.length}`,
  );
  console.log(
    `Corrected: ${correctedProducts.length}`,
  );
  console.log(
    `Already correct: ${alreadyCorrect}`,
  );
  console.log(
    `Failed: ${
      SKU_CORRECTIONS.length
      - correctedProducts.length
      - alreadyCorrect
    }`,
  );
  console.log("");
  console.log(
    "Essential Product SKU correction completed successfully.",
  );
}

main()
  .catch(
    (
      error:
        unknown,
    ) => {
      console.error(
        "Essential Product SKU correction failed.",
      );

      console.error(
        error instanceof Error
          ? error.stack
            ?? error.message
          : String(error),
      );

      process.exitCode = 1;
    },
  )
  .finally(
    async () => {
      await prisma
        .$disconnect();
    },
  );