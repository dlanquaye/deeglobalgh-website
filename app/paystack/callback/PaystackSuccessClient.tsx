"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";

type Props = {
  reference: string;
  status: string;
};

function buildWhatsAppMessage(params: {
  reference: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
}) {
  const lines: string[] = [];

  lines.push("Hello DeeglobalGh, I have completed payment.");
  lines.push("");
  lines.push(`Paystack Reference: ${params.reference}`);
  lines.push("Payment Status: VERIFIED ✅");
  lines.push("");
  lines.push("Order Items:");

  params.items.forEach((x, i) => {
    lines.push(`${i + 1}. ${x.name} x${x.qty} (GH₵ ${x.price})`);
  });

  lines.push("");
  lines.push(`Subtotal: GH₵ ${params.subtotal.toFixed(0)}`);
  lines.push("");
  lines.push("Please confirm delivery fee and delivery time.");
  lines.push("Thank you.");

  return lines.join("\n");
}

export default function PaystackSuccessClient({ reference, status }: Props) {
  const { items, subtotal, clearCart } = useCart();

  const snapshot = useMemo(() => {
    return {
      items: items.map((x) => ({ name: x.name, qty: x.qty, price: x.price })),
      subtotal,
    };
  }, [items, subtotal]);

  const phone = "233246011773"; // 0246 011 773
  const message = useMemo(() => {
    return buildWhatsAppMessage({
      reference,
      items: snapshot.items,
      subtotal: snapshot.subtotal,
    });
  }, [reference, snapshot.items, snapshot.subtotal]);

  const waUrl = useMemo(() => {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [phone, message]);

  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    if (status !== "success") return;

    // ✅ Clear cart once
    if (!cartCleared) {
      clearCart();
      setCartCleared(true);
      setTimeout(() => {
  localStorage.removeItem("dg_paystack_order_snapshot_v1");
}, 20000);


    }

    // ✅ Try auto-open (may be blocked by browser)
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }, [status, clearCart, waUrl, cartCleared]);

  if (status !== "success") return null;

  // ✅ Always show manual button fallback
  return (
    <div style={{ marginTop: 16 }}>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "12px 16px",
          borderRadius: 12,
          fontWeight: 800,
          textDecoration: "none",
          border: "1px solid #0a7c3a",
        }}
      >
        Open WhatsApp to Send Order
      </a>

      <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
        If WhatsApp did not open automatically, click the button above.
      </p>
    </div>
  );
}
