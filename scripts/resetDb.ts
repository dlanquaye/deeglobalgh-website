import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing database...");

  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});

  const count = await prisma.product.count();

  console.log("✅ Products remaining:", count);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });