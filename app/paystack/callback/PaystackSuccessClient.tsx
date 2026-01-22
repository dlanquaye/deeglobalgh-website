"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";

type Props = {
  reference: string;
  status: string;
};

const PAYSTACK_ORDER_SNAPSHOT_KEY = "dg_paystack_order_snapshot_v1";

type Snapshot = {
  customer?: {
    fullName?: string;
    phone?: string;
    area?: string;
    location?: string;
    notes?: string;
  };
  items?: { id: string; name: string; qty: number; price: number }[];
  subtotal?: number;
  createdAt?: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildWhatsAppMessage(params: {
  reference: string;
  customer?: Snapshot["customer"];
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
}) {
  const lines: string[] = [];

  lines.push("Hello DeeglobalGh, I have completed payment.");
  lines.push("");
  lines.push("PAYMENT DETAILS");
  lines.push(`Paystack Reference: ${params.reference}`);
  lines.push("Payment Status: VERIFIED (SUCCESS)");


  lines.push("");
  lines.push("CUSTOMER DETAILS");
  lines.push(`Name: ${params.customer?.fullName || "—"}`);
  lines.push(`Phone: ${params.customer?.phone || "—"}`);
  lines.push(`Delivery Area: ${params.customer?.area || "—"}`);
  lines.push(`Location/Landmark: ${params.customer?.location || "—"}`);

  if (params.customer?.notes?.trim()) {
    lines.push(`Notes: ${params.customer.notes.trim()}`);
  }

  lines.push("");
  lines.push("ORDER ITEMS");

  params.items.forEach((x, i) => {
    lines.push(`${i + 1}. ${x.name} x${x.qty} (GH₵ ${formatMoney(x.price)})`);
  });

  lines.push("");
  lines.push(`SUBTOTAL: GH₵ ${formatMoney(params.subtotal)}`);
  lines.push("");
  lines.push("Please confirm delivery fee and delivery time. Thank you.");

  return lines.join("\n");
}

function safeParseSnapshot(): Snapshot | null {
  try {
    const raw = localStorage.getItem(PAYSTACK_ORDER_SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function PaystackSuccessClient({ reference, status }: Props) {
  const { clearCart } = useCart();

  const snapshot = useMemo(() => safeParseSnapshot(), []);

  const items = useMemo(() => {
    return (snapshot?.items || []).map((x) => ({
      name: x.name,
      qty: x.qty,
      price: x.price,
    }));
  }, [snapshot]);

  const subtotal = snapshot?.subtotal || 0;

  const phone = "233246011773"; // DeeGlobal WhatsApp

  const message = useMemo(() => {
    return buildWhatsAppMessage({
      reference,
      customer: snapshot?.customer,
      items,
      subtotal,
    });
  }, [reference, snapshot?.customer, items, subtotal]);

  const waUrl = useMemo(() => {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [phone, message]);

  const [didRun, setDidRun] = useState(false);

  useEffect(() => {
    if (status !== "success") return;
    if (didRun) return;

    setDidRun(true);

    // ✅ First open WhatsApp
    window.location.href = waUrl;

    // ✅ Then clear cart after a short delay
    setTimeout(() => {
      clearCart();
    }, 2000);

    // ✅ Remove snapshot after 1 minute (in case page reloads)
    setTimeout(() => {
      localStorage.removeItem(PAYSTACK_ORDER_SNAPSHOT_KEY);
    }, 60000);
  }, [status, waUrl, clearCart, didRun]);

  if (status !== "success") return null;

  return (
    <div style={{ marginTop: 16 }}>
      <a
        href={waUrl}
        style={{
          display: "inline-block",
          padding: "12px 16px",
          borderRadius: 12,
          fontWeight: 800,
          textDecoration: "none",
          border: "1px solid #0a7c3a",
        }}
      >
        Open WhatsApp to Send Paid Order
      </a>

      <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
        If WhatsApp did not open automatically, click the button above.
      </p>
    </div>
  );
}
