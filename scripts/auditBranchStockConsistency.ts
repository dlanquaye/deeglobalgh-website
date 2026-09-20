import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.findFirst({
    where: {
      name: {
        contains: "Kasoa",
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!branch) {
    throw new Error("Kasoa branch not found.");
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      name: true,
      stockQty: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const branchInventory =
    await prisma.inventory.findMany({
      where: {
        locationType: "BRANCH",
        locationId: branch.id,
      },
      select: {
        productId: true,
        quantity: true,
      },
    });

  const inventoryByProductId = new Map(
    branchInventory.map((row) => [
      row.productId,
      row.quantity,
    ])
  );

  const mismatches = products
    .map((product) => {
      const branchQty =
        inventoryByProductId.get(product.id) ?? 0;

      return {
        sku: product.sku,
        name: product.name,
        productStockQty: product.stockQty,
        branchInventoryQty: branchQty,
        difference:
          product.stockQty - branchQty,
      };
    })
    .filter(
      (item) =>
        item.productStockQty !==
        item.branchInventoryQty
    );

  console.log("");
  console.log("Branch:", branch.name);
  console.log(
    "Products checked:",
    products.length
  );
  console.log(
    "Branch inventory rows:",
    branchInventory.length
  );
  console.log(
    "Mismatches:",
    mismatches.length
  );
  console.log("");

  if (mismatches.length === 0) {
    console.log(
      "PASS: Product.stockQty matches branch Inventory for all products."
    );
    return;
  }

  console.table(mismatches);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
