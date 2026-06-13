import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WAREHOUSE_ID =
  "cmq4b5g1j0001g3jgy501zz76";

async function main() {
  console.log("📦 Initializing warehouse inventory...");

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const existing = await prisma.inventory.findFirst({
      where: {
        productId: product.id,
        locationType: "WAREHOUSE",
        locationId: WAREHOUSE_ID,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.inventory.create({
      data: {
        productId: product.id,
        locationType: "WAREHOUSE",
        locationId: WAREHOUSE_ID,
        quantity: 0,
      },
    });

    created++;
  }

  console.log("");
  console.log("🎉 Warehouse Inventory Initialization Complete");
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Products: ${products.length}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});