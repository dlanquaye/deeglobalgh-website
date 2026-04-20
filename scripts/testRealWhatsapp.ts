import { prisma } from "../lib/prisma.ts";

// WhatsApp helpers
function generateWhatsAppMessage(order: {
  orderId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
}) {
  let message = `Hello, I want to place an order:\n\n`;

  message += `Order ID: ${order.orderId}\n\n`;

  for (const item of order.items) {
    message += `• ${item.name} x${item.quantity} - GHS ${item.price}\n`;
  }

  message += `\nTotal: GHS ${order.total}\n\n`;
  message += `Please confirm availability and delivery.`;

  return encodeURIComponent(message);
}

function generateWhatsAppLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${message}`;
}

async function testRealWhatsapp() {
  console.log("🚀 Generating REAL WhatsApp order...");

  // 1. Get latest order
  const order = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    console.log("❌ No order found");
    return;
  }

  // 2. Get items
  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    include: {
      product: true,
    },
  });

  // 3. Format items
  const formattedItems = items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.totalPrice,
  }));

  // 4. Generate message
  const message = generateWhatsAppMessage({
    orderId: order.orderId,
    items: formattedItems,
    total: order.amount,
  });

  // 5. Generate link
  const link = generateWhatsAppLink("233246011773", message);

  console.log("\n✅ REAL ORDER LINK:\n");
  console.log(link);
}

testRealWhatsapp()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });