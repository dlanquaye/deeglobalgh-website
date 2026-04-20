// SIMPLE WHATSAPP TEST (COPY EVERYTHING)

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

// 🔥 TEST DATA (SIMULATED ORDER)
const message = generateWhatsAppMessage({
  orderId: "ORD-TEST-001",
  items: [
    { name: "Pen", quantity: 2, price: 5 },
    { name: "Exercise Book", quantity: 1, price: 20 },
  ],
  total: 30,
});

// 👉 YOUR REAL WHATSAPP NUMBER (already correct)
const link = generateWhatsAppLink("233246011773", message);

console.log("\n✅ COPY THIS LINK AND OPEN IN BROWSER:\n");
console.log(link);