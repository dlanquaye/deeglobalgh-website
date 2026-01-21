"use client";

import { useEffect, useState } from "react";

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

export default function OrderSummaryClient() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PAYSTACK_ORDER_SNAPSHOT_KEY);
      if (!raw) return;
      setSnapshot(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  if (!snapshot?.items?.length) return null;

  const totalItems = snapshot.items.reduce((sum, x) => sum + x.qty, 0);

  return (
    <div
      style={{
        marginTop: 18,
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 16,
      }}
    >
      <h3 style={{ fontWeight: 900, marginBottom: 10 }}>Order Summary</h3>

      <div style={{ fontSize: 14, opacity: 0.9 }}>
        <div>
          <b>Customer:</b> {snapshot.customer?.fullName || "—"}
        </div>
        <div>
          <b>Phone:</b> {snapshot.customer?.phone || "—"}
        </div>
        <div>
          <b>Area:</b> {snapshot.customer?.area || "—"}
        </div>
        <div>
          <b>Location:</b> {snapshot.customer?.location || "—"}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {snapshot.items.map((x) => (
          <div
            key={x.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              padding: "8px 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: 14,
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {x.name} <span style={{ opacity: 0.8 }}>x{x.qty}</span>
            </div>
            <div style={{ fontWeight: 900 }}>
              GH₵ {formatMoney(x.price * x.qty)}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: 800 }}>Total items: {totalItems}</div>
        <div style={{ fontWeight: 900 }}>
          Subtotal: GH₵ {formatMoney(snapshot.subtotal || 0)}
        </div>
      </div>
    </div>
  );
}
