export function generateWhatsAppMessage(order: {
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