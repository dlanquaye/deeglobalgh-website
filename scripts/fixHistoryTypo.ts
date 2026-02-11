import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing 'hiatory' typo including slugs...");

  const products = await prisma.product.findMany({
    where: {
      slug: { contains: "hiatory" },
    },
  });

  for (const product of products) {
    const correctedSlug = product.slug.replace(/hiatory/gi, "history");

    await prisma.product.update({
      where: { id: product.id },
      data: {
        slug: correctedSlug,
        name: product.name.replace(/hiatory/gi, "History"),
      },
    });

    console.log(`Fixed slug: ${product.slug} → ${correctedSlug}`);
  }

  console.log("Slug typo correction completed.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
