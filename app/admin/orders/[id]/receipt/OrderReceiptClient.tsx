"use client";

import { useState } from "react";
import PrintButton from "./PrintButton";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function OrderReceiptClient({ order }: any) {
    
  const [reason, setReason] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitReason = async () => {
    if (reason.trim().length < 5) {
      setError("Please provide a valid reason (min 5 characters)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/log-order-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.orderId,
          reason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to log access");
        setLoading(false);
        return;
      }

      setUnlocked(true);
    } catch {
      setError("Failed to log access");
      setLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-bold">
            Reason Required
          </h2>

          <p className="mb-4 text-sm text-gray-600">
            You must provide a reason for opening this order.
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mb-3 w-full rounded border px-3 py-2"
            rows={4}
          />

          {error && (
            <p className="mb-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={submitReason}
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            {loading ? "Submitting..." : "Submit & View Order"}
          </button>
        </div>
      </main>
    );
  }

  const total =
    order.amount + (order.deliveryFee ?? 0);

  return (
    <main className="mx-auto max-w-2xl bg-white p-8 print:p-0">
      <h1 className="mb-6 text-2xl font-extrabold">
        Order Receipt
      </h1>

      <div className="space-y-4 text-sm">
        <div>
          <strong>Order ID:</strong> {order.orderId}
        </div>

        <div>
          <strong>Date:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </div>

        <hr />

        <div>
          <strong>Email:</strong> {order.email}
        </div>

        <div>
          <strong>Phone:</strong> {order.phone}
        </div>

        <hr />

        <div>
          <strong>Subtotal:</strong> GHS {formatMoney(order.amount)}
        </div>

        {order.deliveryFee !== null && (
          <div>
            <strong>Delivery Fee:</strong> GHS{" "}
            {formatMoney(order.deliveryFee)}
          </div>
        )}

        <div className="text-lg font-bold">
          Total: GHS {formatMoney(total)}
        </div>

        <hr />

        <div>
          <strong>Status:</strong> {order.paymentStatus}
        </div>

        {order.adminNotes && (
          <div>
            <strong>Admin Notes:</strong>
            <div className="mt-1 whitespace-pre-wrap">
              {order.adminNotes}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 print:hidden">
        <PrintButton />

        <a
          href="/admin/db-orders"
          className="rounded border px-4 py-2"
        >
          Back to Orders
        </a>
      </div>
    </main>
  );
}