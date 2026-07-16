import { prisma } from "../lib/prisma";
import { persistFingerprint } from "../lib/knowledge/persistFingerprint";

async function main() {
  console.log("\n=======================================");
  console.log("GENERATING PRODUCT FINGERPRINTS");
  console.log("=======================================\n");

  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  });

  console.log(`Products Found: ${products.length}\n`);

  let processed = 0;

  for (const product of products) {
    process.stdout.write(
      `[${processed + 1}/${products.length}] ${product.name} ... `
    );

    await persistFingerprint({
      id: product.id,
      productName: product.name,
    });

    console.log("✓");

    processed++;
  }

  const totalFingerprints =
    await prisma.productFingerprint.count();

  console.log("\n=======================================");
  console.log("COMPLETE");
  console.log("=======================================\n");

  console.log(`Products Processed : ${processed}`);
  console.log(`Fingerprints Saved : ${totalFingerprints}`);

  console.log("\nKnowledge Base Successfully Generated.\n");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });