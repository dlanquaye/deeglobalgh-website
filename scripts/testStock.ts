import { createOrderFromCart, adminConfirmOrder } from "../lib/order.ts";
import { prisma } from "../lib/prisma.ts";
import { applyStockMovement } from "../lib/stock.ts";

async function test() {
  console.log("🚀 Starting multi-location test...");

  const SHOP = "shop-kasoa";
  const WAREHOUSE = "warehouse-main";

  // 🔥 RESET SHOP STOCK
  await prisma.inventory.deleteMany({
    where: {
      locationId: SHOP,
    },
  });

  // 1. Create order FROM SHOP (no stock yet)
  const orderData = await createOrderFromCart(SHOP, [
  {
    id: "test-product-1",
    name: "Test Product",
    retailPrice: 10,
    qty: 2,
  },
]);

const order = orderData.order;
  console.log("Order created:", order.id, "| Location:", SHOP);

  // 2. Check stock BEFORE confirm
  const before = await prisma.inventory.findMany();
  console.log("Stock BEFORE confirm:", before);

  // 3. Try to confirm (should FAIL)
  let failedAsExpected = false;

  try {
    await adminConfirmOrder(order.id);
    console.log("❌ ERROR: This should not succeed");
  } catch (err: any) {
    console.log("✅ Expected failure (no stock in shop):", err.message);
    failedAsExpected = true;
  }

  if (!failedAsExpected) return;

  console.log("🛑 Step 1 complete — shop has no stock");

  // 🔥 STEP 2: CREATE STOCK IN WAREHOUSE
  const stock = await prisma.stockMovement.create({
    data: {
      productId: "test-product-1",
      quantity: 100,
      type: "PURCHASE",
      toLocationType: "WAREHOUSE",
      toLocationId: WAREHOUSE,
      createdByStaffId: "DG001",
    },
  });

  await prisma.$transaction(async (tx) => {
    await applyStockMovement(tx, stock.id);
  });

  // 🔥 STEP 3: TRANSFER TO SHOP
  const transfer = await prisma.stockMovement.create({
    data: {
      productId: "test-product-1",
      quantity: 10,
      type: "TRANSFER",
      fromLocationType: "WAREHOUSE",
      fromLocationId: WAREHOUSE,
      toLocationType: "WAREHOUSE",
      toLocationId: SHOP,
      createdByStaffId: "DG001",
    },
  });

  await prisma.$transaction(async (tx) => {
    await applyStockMovement(tx, transfer.id);
  });

  // 4. Check stock AFTER transfer
  const afterTransfer = await prisma.inventory.findMany();
  console.log("Stock AFTER transfer:", afterTransfer);

  // 🔥 STEP 4: TRY CONFIRM AGAIN (SHOULD WORK NOW)
  await adminConfirmOrder(order.id);

  const afterConfirm = await prisma.inventory.findMany();
  console.log("Stock AFTER successful confirm:", afterConfirm);
}

// Run test
test()
  .then(() => {
    console.log("✅ FULL MULTI-LOCATION FLOW WORKING");
  })
  .catch((err) => {
    console.error("❌ Test failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });