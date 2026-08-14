export function buildAdminOrderMessage(order: any) {
  return `
🟢 NEW PAID ORDER

Order ID: ${order.orderId}
Reference: ${order.reference}

Customer Email: ${order.email}
Customer Phone: ${order.phone}

Amount Paid: GHS ${order.amount}

Payment Status: ${order.paymentStatus}

Ready for delivery.
`.trim()
}

export function buildWhatsAppLink(message: string) {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/233270030000?text=${encoded}`
}