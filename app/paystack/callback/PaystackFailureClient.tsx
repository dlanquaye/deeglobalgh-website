"use client";

import { useEffect, useState } from "react";

const ORDERS_KEY = "dg_orders_v1";

type OrderRecord = {
  id: string;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
    area: string;
    location: string;
    notes?: string;
  };
  items: { id: string; name: string; qty: number; price: number }[];
  subtotal: number;
  paymentMethod: "PAYSTACK" | "PAY_ON_DELIVERY";
  paystackReference?: string;
  paystackStatus?: "success" | "failed" | "abandoned" | "unknown";
};

function safeParseOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OrderRecord[]) : [];
  } catch {
    return [];
  }
}

/**
 * ✅ Updates the most recent PAYSTACK order with reference + status (failed/abandoned/unknown)
 */
function markLatestPaystackOrder(reference: string, status: string) {
  const orders = safeParseOrders();
  if (!orders.length) return;

  const idx = orders.findIndex((o) => o.paymentMethod === "PAYSTACK");
  if (idx === -1) return;

  const normalized: "failed" | "abandoned" | "unknown" =
    status === "failed"
      ? "failed"
      : status === "abandoned"
      ? "abandoned"
      : "unknown";

  const updated: OrderRecord = {
    ...orders[idx],
    paystackReference: reference,
    paystackStatus: normalized,
  };

  const next = [...orders];
  next[idx] = updated;

  localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
}

export default function PaystackFailureClient({
  reference,
  status,
}: {
  reference: string;
  status: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (!reference) return;

    markLatestPaystackOrder(reference, status);
    setDone(true);
  }, [reference, status, done]);

  return null;
}
