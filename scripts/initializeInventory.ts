import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BRANCH_ID = "cmq4b407s0000g3jg31elgm80";

async function main() {
  console.log("📦 Initializing inventory...");

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      stockQty: true,
    },
  });

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const existing = await prisma.inventory.findFirst({
      where: {
        productId: product.id,
        locationType: "BRANCH",
        locationId: BRANCH_ID,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.inventory.create({
      data: {
        productId: product.id,
        locationType: "BRANCH",
        locationId: BRANCH_ID,
        quantity: product.stockQty,
      },
    });

    created++;

    console.log(
      `✅ ${product.name} → ${product.stockQty} units`
    );
  }

  console.log("");
  console.log("🎉 Inventory Initialization Complete");
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