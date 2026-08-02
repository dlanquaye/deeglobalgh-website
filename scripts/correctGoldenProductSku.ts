import {
  PrismaClient,
} from "@prisma/client";

const prisma =
  new PrismaClient();

const PRODUCT_NAME =
  "Golden English Textbook for Basic 4";

const CURRENT_SKU =
  " DG-B1-ENG-GLD-090";

const CORRECTED_SKU =
  "DG-B1-ENG-GLD-090";

function normaliseValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("en")
    .replace(/\s+/g, " ");
}

async function main():
  Promise<void> {
  console.log(
    "Golden Product SKU Correction",
  );
  console.log(
    "=============================",
  );
  console.log(
    "Approved Products: 1",
  );
  console.log(
    "Mode: CONTROLLED WRITE — one verified SKU only",
  );
  console.log("");
  console.log(
    "Running complete preflight verification...",
  );
  console.log("");

  const product =
    await prisma.product.findFirst({
      where: {
        OR: [
          {
            sku:
              CURRENT_SKU,
          },

          {
            sku:
              CORRECTED_SKU,
          },
        ],
      },

      select: {
        id: true,

        name: true,

        sku: true,
      },
    });

  if (!product) {
    throw new Error(
      [
        "The approved Golden English Basic 4 Product could not be found.",
        `Expected current SKU: ${JSON.stringify(CURRENT_SKU)}.`,
        `Expected corrected SKU: ${CORRECTED_SKU}.`,
      ].join(" "),
    );
  }

  if (
    normaliseValue(product.name)
    !== normaliseValue(
      PRODUCT_NAME,
    )
  ) {
    throw new Error(
      [
        "Product name verification failed.",
        `Expected: ${PRODUCT_NAME}.`,
        `Actual: ${product.name}.`,
      ].join(" "),
    );
  }

  if (
    product.sku
    === CORRECTED_SKU
  ) {
    console.log(
      [
        "ALREADY CORRECT",
        CORRECTED_SKU,
        product.name,
      ].join(" | "),
    );

    console.log("");
    console.log(
      "SKU correction summary",
    );
    console.log(
      "----------------------",
    );
    console.log(
      "Approved: 1",
    );
    console.log(
      "Corrected: 0",
    );
    console.log(
      "Already correct: 1",
    );
    console.log(
      "Failed: 0",
    );
    console.log("");
    console.log(
      "Golden Product SKU correction completed successfully.",
    );

    return;
  }

  if (
    product.sku
    !== CURRENT_SKU
  ) {
    throw new Error(
      [
        "Stored SKU verification failed.",
        `Expected: ${JSON.stringify(CURRENT_SKU)}.`,
        `Actual: ${JSON.stringify(product.sku)}.`,
      ].join(" "),
    );
  }

  const conflictingProduct =
    await prisma.product.findFirst({
      where: {
        sku:
          CORRECTED_SKU,

        id: {
          not:
            product.id,
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
        `The corrected SKU ${CORRECTED_SKU} is already used by another Product.`,
        `Product ID: ${conflictingProduct.id}.`,
        `Product name: ${conflictingProduct.name}.`,
      ].join(" "),
    );
  }

  console.log(
    [
      "APPROVED FOR CORRECTION",
      JSON.stringify(
        CURRENT_SKU,
      ),
      "->",
      CORRECTED_SKU,
      product.name,
    ].join(" | "),
  );

  console.log("");
  console.log(
    "Preflight verification passed.",
  );
  console.log(
    "Beginning controlled SKU correction...",
  );

  await prisma.$transaction(
    async (
      transaction,
    ) => {
      const updateResult =
        await transaction.product.updateMany({
          where: {
            id:
              product.id,

            sku:
              CURRENT_SKU,
          },

          data: {
            sku:
              CORRECTED_SKU,
          },
        });

      if (
        updateResult.count
        !== 1
      ) {
        throw new Error(
          [
            "Golden Product SKU correction failed.",
            "The Product may have changed after preflight verification.",
          ].join(" "),
        );
      }

      const verifiedProduct =
        await transaction.product.findUnique({
          where: {
            id:
              product.id,
          },

          select: {
            name: true,

            sku: true,
          },
        });

      if (
        !verifiedProduct
        || verifiedProduct.sku
          !== CORRECTED_SKU
      ) {
        throw new Error(
          `Post-write verification failed for ${CORRECTED_SKU}.`,
        );
      }

      if (
        normaliseValue(
          verifiedProduct.name,
        )
        !== normaliseValue(
          PRODUCT_NAME,
        )
      ) {
        throw new Error(
          "Post-write Product name verification failed.",
        );
      }
    },
  );

  console.log("");
  console.log(
    [
      "CORRECTED",
      CORRECTED_SKU,
      PRODUCT_NAME,
    ].join(" | "),
  );

  console.log("");
  console.log(
    "SKU correction summary",
  );
  console.log(
    "----------------------",
  );
  console.log(
    "Approved: 1",
  );
  console.log(
    "Corrected: 1",
  );
  console.log(
    "Already correct: 0",
  );
  console.log(
    "Failed: 0",
  );
  console.log("");
  console.log(
    "Golden Product SKU correction completed successfully.",
  );
}

main()
  .catch(
    (
      error:
        unknown,
    ) => {
      console.error(
        "Golden Product SKU correction failed.",
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