"use client";

import { useEffect, useState } from "react";

type DbOrder = {
  id: string;
  reference: string | null;
  phone: string;
  email: string;
  amount: number;
  paymentStatus: "PAID" | "FAILED" | "PENDING";
  smsSent: boolean;
  createdAt: string;
};

export default function AdminDbOrdersPage() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch("/api/admin/db-orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">
        Database Orders (Read-Only)
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
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Amount (GHS)</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">SMS</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3 font-mono">
                    {o.reference || "-"}
                  </td>
                  <td className="px-4 py-3">{o.phone}</td>
                  <td className="px-4 py-3 font-bold">
                    {(o.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        o.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : o.paymentStatus === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.smsSent ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(o.createdAt).toLocaleString()}
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
