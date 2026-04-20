import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting safe deletion...");

  // 1️⃣ Delete order items FIRST
  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`🧹 Deleted ${deletedOrderItems.count} order items`);

  // 2️⃣ Now delete products
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`✅ Deleted ${deletedProducts.count} products`);
}

main()
  .catch((e) => {
    console.error("❌ Error deleting:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });