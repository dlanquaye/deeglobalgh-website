import { prisma } from "@/lib/prisma";

async function main() {
  const products = await prisma.product.findMany({
    select: {
      name: true,
      categorySlug: true,
      brand: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 100,
  });

  console.table(products);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });