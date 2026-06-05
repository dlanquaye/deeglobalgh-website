const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function healthCheck() {
  try {
    console.log('Checking database...');

    const productCount = await prisma.product.count();
    const firstProduct = await prisma.product.findFirst({
  select: {
    name: true,
    sku: true,
    slug: true,
  },
});
    const inventoryCount = await prisma.inventory.count();
const orderCount = await prisma.order.count();
const adminCount = await prisma.admin.count();
const branchCount = await prisma.branch.count();
const warehouseCount = await prisma.warehouse.count();

    console.log('✅ Database Connected');
console.log(`✅ Products: ${productCount}`);
if (firstProduct) {
  console.log(`✅ First Product: ${firstProduct.name}`);
  console.log(`✅ First SKU: ${firstProduct.sku}`);
  console.log(`✅ First Slug: ${firstProduct.slug}`);
}
console.log(`✅ Admins: ${adminCount}`);
console.log(`✅ Branches: ${branchCount}`);
console.log(`✅ Warehouses: ${warehouseCount}`);
console.log(`✅ Inventory Records: ${inventoryCount}`);
console.log(`✅ Orders: ${orderCount}`);
console.log(`✅ Check Time: ${new Date().toISOString()}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Health Check Failed');
    console.error(error);

    await prisma.$disconnect();
    process.exit(1);
  }
}

healthCheck();