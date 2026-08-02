import {
  PrismaClient,
} from "@prisma/client";

const prisma =
  new PrismaClient();

async function main():
  Promise<void> {
  console.log(
    "Essential Product SKU Inspection",
  );
  console.log(
    "================================",
  );
  console.log(
    "Mode: READ ONLY — no database writes",
  );
  console.log("");

  const products =
    await prisma.product.findMany({
      where: {
        OR: [
          {
            name:
              "Essential English Textbook For Basic 6",
          },

          {
            name:
              "Essential Science Textbook For Basic 3",
          },

          {
            sku: {
              contains:
                "ESS-057",
            },
          },

          {
            sku: {
              contains:
                "ESS-060",
            },
          },
        ],
      },

      select: {
        id: true,

        sku: true,

        name: true,

        isActive: true,

        educationalEntityId: true,

        educationalEditionId: true,
      },

      orderBy: [
        {
          name: "asc",
        },

        {
          sku: "asc",
        },
      ],
    });

  console.log(
    `Products found: ${products.length}`,
  );

  for (
    const product
    of products
  ) {
    const trimmedSku =
      product.sku.trim();

    console.log("");
    console.log(
      "------------------------------------------------------------",
    );
    console.log(
      `Product ID: ${product.id}`,
    );
    console.log(
      `Product name: ${product.name}`,
    );
    console.log(
      `SKU as JSON: ${JSON.stringify(product.sku)}`,
    );
    console.log(
      `SKU length: ${product.sku.length}`,
    );
    console.log(
      `Trimmed SKU: ${trimmedSku}`,
    );
    console.log(
      `Leading or trailing whitespace: ${
        product.sku === trimmedSku
          ? "NO"
          : "YES"
      }`,
    );
    console.log(
      `Active: ${product.isActive}`,
    );
    console.log(
      `Educational entity: ${product.educationalEntityId ?? "None"}`,
    );
    console.log(
      `Educational edition: ${product.educationalEditionId ?? "None"}`,
    );
  }

  console.log("");
  console.log(
    "Inspection completed. No database records were changed.",
  );
}

main()
  .catch(
    (
      error:
        unknown,
    ) => {
      console.error(
        "Essential Product SKU inspection failed.",
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