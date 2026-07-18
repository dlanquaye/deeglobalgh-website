import { prisma } from "@/lib/prisma";

async function main() {
  const product = await prisma.product.findFirst({
    where: {
      name: {
        contains: "Golden English",
      },
    },
    include: {
      fingerprint: true,
    },
  });

  console.dir(product, {
    depth: null,
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });