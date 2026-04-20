import { createOrderAndWhatsAppLink } from "../lib/order.ts";

async function testCheckout() {
  console.log("🚀 Testing WhatsApp Checkout...");

  const result = await createOrderAndWhatsAppLink("shop-kasoa", [
  {
    id: "test-product-1",
    name: "Test Product",
    retailPrice: 10,
    qty: 2,
  },
]);

  console.log("\n✅ OPEN THIS LINK:\n");
  console.log(result.link);
}

testCheckout()
  .catch(console.error);