"use client";

import { useEffect, useState } from "react";

type DbOrder = {
  id: string;
  orderId: string;
  reference: string | null;
  phone: string;
  email: string;
  amount: number;
  deliveryFee: number | null;
  adminNotes: string | null;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "DELIVERING" | "COMPLETED";
  smsSent: boolean;
  createdAt: string;
};

export default function AdminDbOrdersPage() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/db-orders", {
      cache: "no-store",
    });
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (
    orderId: string,
    status: DbOrder["paymentStatus"]
  ) => {
    await fetch("/api/admin/update-order-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });

    loadOrders();
  };

  const saveMeta = async (order: DbOrder) => {
    setSavingOrderId(order.orderId);

    await fetch("/api/admin/update-order-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.orderId,
        deliveryFee: order.deliveryFee,
        adminNotes: order.adminNotes,
      }),
    });

    setSavingOrderId(null);
    loadOrders();
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">
        Database Orders (Admin)
      </h1>

      {loading ? (
        <p>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Amount (GHS)</th>
                <th className="px-4 py-3 text-left">Delivery Fee</th>
                <th className="px-4 py-3 text-left">Admin Notes</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t align-top">
                  <td className="px-4 py-3 font-mono">{o.orderId}</td>
                  <td className="px-4 py-3">{o.phone}</td>
                  <td className="px-4 py-3 font-bold">
                    {o.amount.toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className="w-24 rounded border px-2 py-1"
                      value={o.deliveryFee ?? ""}
                      onChange={(e) =>
                        setOrders((prev) =>
                          prev.map((x) =>
                            x.id === o.id
                              ? {
                                  ...x,
                                  deliveryFee: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                }
                              : x
                          )
                        )
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <textarea
                      className="w-48 rounded border px-2 py-1 text-xs"
                      rows={2}
                      value={o.adminNotes ?? ""}
                      onChange={(e) =>
                        setOrders((prev) =>
                          prev.map((x) =>
                            x.id === o.id
                              ? { ...x, adminNotes: e.target.value }
                              : x
                          )
                        )
                      }
                    />
                  </td>

                  <td className="px-4 py-3 font-bold">
                    {o.paymentStatus}
                  </td>

                  <td className="px-4 py-3 space-y-2">
                    {o.paymentStatus === "PAID" && (
                      <button
                        onClick={() =>
                          updateStatus(o.orderId, "DELIVERING")
                        }
                        className="block rounded bg-blue-600 px-3 py-1 text-white"
                      >
                        Start Delivery
                      </button>
                    )}

                    {o.paymentStatus === "DELIVERING" && (
                      <button
                        onClick={() =>
                          updateStatus(o.orderId, "COMPLETED")
                        }
                        className="block rounded bg-green-600 px-3 py-1 text-white"
                      >
                        Mark Completed
                      </button>
                    )}

                    <button
                      onClick={() => saveMeta(o)}
                      disabled={savingOrderId === o.orderId}
                      className="block rounded bg-gray-800 px-3 py-1 text-white"
                    >
                      {savingOrderId === o.orderId ? "Saving…" : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
