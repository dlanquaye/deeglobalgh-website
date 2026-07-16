import { prisma } from "../lib/prisma";
import { persistFingerprint } from "../lib/knowledge/persistFingerprint";

async function main() {
  const product = await prisma.product.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!product) {
    console.log("No products found.");
    return;
  }

  console.log("Generating fingerprint for:");
  console.log(product.name);

  const fingerprint = await persistFingerprint({
    id: product.id,
    productName: product.name,
  });

  console.log("\nGenerated Fingerprint:");
  console.dir(fingerprint, { depth: null });

  const saved = await prisma.productFingerprint.findUnique({
    where: {
      productId: product.id,
    },
  });

  console.log("\nSaved Record:");
  console.dir(saved, { depth: null });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });