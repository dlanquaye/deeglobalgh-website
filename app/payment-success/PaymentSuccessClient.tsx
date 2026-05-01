"use client";

import { useEffect, useState, useRef } from "react";
import { useCart } from "@/app/context/CartContext";

type Props = {
  reference: string | null;
};

export default function PaymentSuccessClient({ reference }: Props) {
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);

  

  /* ===============================
     🧹 CLEAR CART (ONCE)
  =============================== */
  useEffect(() => {
  if (!reference) return;

  clearCart();
}, [reference]);

  /* ===============================
     🔐 VERIFY PAYMENT
  =============================== */
  useEffect(() => {
    if (!reference) return;

    async function verifyPayment() {
      try {
        const res = await fetch(
          `/api/paystack/verify?reference=${reference}`
        );
        const data = await res.json();

        console.log("Verification result:", data);
      } catch (err) {
        console.error("Verification failed:", err);
      }
    }

    verifyPayment();
  }, [reference]);

  /* ===============================
     📦 FETCH ORDER DETAILS
  =============================== */
  useEffect(() => {
    if (!reference) return;

    async function fetchOrder() {
      try {
        const res = await fetch(
          `/api/order-by-reference?reference=${reference}`
        );
        const data = await res.json();

        if (!data.error) {
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      }
    }

    fetchOrder();
  }, [reference]);

  /* ===============================
     📲 WHATSAPP (RUN ONCE ONLY)
  =============================== */
  useEffect(() => {
  if (!order) return;

  const key = `whatsapp_sent_${order.orderId}`;

  // ✅ Check if already sent
  if (localStorage.getItem(key)) return;

  // ✅ Mark as sent
  localStorage.setItem(key, "true");

  const message = `
🧾 *NEW PAID ORDER — DEEGLOBALGH*

👤 Name: ${order.customer?.fullName || order.email}
📞 Phone: ${order.customer?.phone || order.phone || "N/A"}

📍 Delivery Location:
${order.customer?.location || order.location || "N/A"}
📍 Area: ${order.customer?.area || order.area || "N/A"}

🛒 Items:
${order.orderItems
  ?.map((i: any, index: number) => 
    `${index + 1}. ${i.product?.name ?? "Unknown Product"} x${i.quantity}`
  )
  .join("\n")}
  💰 Total Paid: GHS ${order.amount}

🆔 Order ID: ${order.orderId}

✅ Payment Status: PAID
`;


  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/233246011773?text=${encoded}`;

  window.open(url, "_blank");
}, [order]);

  /* ===============================
     🎉 UI
  =============================== */
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful
      </h1>

      <p className="mt-4 text-lg text-gray-700">
        Your payment has been received successfully.
      </p>

      <p className="mt-6 text-gray-700">
        We are processing your order and will contact you shortly for delivery.
      </p>
    </main>
  );
}