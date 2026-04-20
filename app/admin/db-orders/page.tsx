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
  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "DELIVERING"
    | "COMPLETED"
    | "PROCESSING"
    | "DELIVERED";
  smsSent: boolean;
  createdAt: string;
};
<button
  onClick={async () => {
    const res = await fetch("/api/admin/send-daily-report", {
      method: "POST",
    });

    const data = await res.json();

    if (data.whatsappUrl) {
      window.open(data.whatsappUrl, "_blank");
    }
  }}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Send Daily Report
</button>
export default function AdminDbOrdersClient() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [filter, setFilter] = useState<
    "ALL" | "PAID" | "PROCESSING" | "DELIVERED"
  >("ALL");
  const [dateFilter, setDateFilter] = useState<
    "ALL" | "TODAY" | "WEEK" | "MONTH"
  >("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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

  // SUMMARY
  const totalOrders = orders.length;
  const now = new Date();

const todayRevenue = orders
  .filter((o) => {
    const d = new Date(o.createdAt);
    return (
      o.paymentStatus === "PAID" &&
      d.toDateString() === now.toDateString()
    );
  })
  .reduce((sum, o) => sum + o.amount, 0);

const weekRevenue = orders
  .filter((o) => {
    const d = new Date(o.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    return o.paymentStatus === "PAID" && d >= oneWeekAgo;
  })
  .reduce((sum, o) => sum + o.amount, 0);

const monthRevenue = orders
  .filter((o) => {
    const d = new Date(o.createdAt);
    return (
      o.paymentStatus === "PAID" &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  })
  .reduce((sum, o) => sum + o.amount, 0);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.amount, 0);

  const processingOrders = orders.filter((o) => {
    const status =
      o.paymentStatus === "DELIVERING"
        ? "PROCESSING"
        : o.paymentStatus;
    return status === "PROCESSING";
  }).length;

  const deliveredOrders = orders.filter((o) => {
    const status =
      o.paymentStatus === "COMPLETED"
        ? "DELIVERED"
        : o.paymentStatus;
    return status === "DELIVERED";
  }).length;
const getWhatsAppMessage = (order: DbOrder, status: string) => {
  if (status === "PROCESSING") {
    return `Hello, your order (${order.orderId}) is now being processed. We will contact you shortly for delivery. Thank you for choosing DeeglobalGh.`;
  }

  if (status === "DELIVERED") {
    return `Hello, your order (${order.orderId}) has been delivered successfully. Thank you for shopping with DeeglobalGh.`;
  }

  return "";
};
  const updateStatus = async (
  id: string,
  status: DbOrder["paymentStatus"]
) => {
  setUpdatingOrderId(id);

  try {
    let backendStatus = status;

    if (status === "PROCESSING") backendStatus = "DELIVERING";
    if (status === "DELIVERED") backendStatus = "COMPLETED";

    const res = await fetch("/api/admin/update-order-status", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: backendStatus }),
    });

    const result = await res.json();

    if (!res.ok) {
  console.error("Status update failed:", result);
  return;
}

    const order = orders.find((o) => o.id === id);

    if (order) {
      const message = getWhatsAppMessage(order, status);

      if (message) {
        const encoded = encodeURIComponent(message);
        const phone = order.phone.replace(/^0/, "233");

        window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
      }
    }

    await loadOrders();
  } catch (error) {
    console.error("Error updating status:", error);
  }

  setUpdatingOrderId(null);
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
const handleSendReport = async () => {
  try {
    const res = await fetch("/api/admin/daily-report");
    const data = await res.json();

    const message = encodeURIComponent(data.message);

    const phones = [
  "233246011773", // You
  "233541131111", // Second number
];

    phones.forEach((phone) => {
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, "_blank");
});
  } catch (error) {
    console.error("Failed to send report:", error);
  }
};
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">
        Database Orders (Admin)
      </h1>
<div className="mb-4">
  <button
    onClick={handleSendReport}
    className="bg-green-600 text-white px-4 py-2 rounded-lg"
  >
    Send Daily Report
  </button>
</div>
      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">Total Orders</p>
    <p className="text-xl font-bold">{totalOrders}</p>
  </div>

  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">Today (GHS)</p>
    <p className="text-xl font-bold">{todayRevenue.toFixed(2)}</p>
  </div>

  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">This Week</p>
    <p className="text-xl font-bold">{weekRevenue.toFixed(2)}</p>
  </div>

  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">This Month</p>
    <p className="text-xl font-bold">{monthRevenue.toFixed(2)}</p>
  </div>

  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">Total Revenue</p>
    <p className="text-xl font-bold">{totalRevenue.toFixed(2)}</p>
  </div>
</div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by Order ID or Phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded border px-3 py-2"
      />

      {/* STATUS FILTER */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {["ALL", "PAID", "PROCESSING", "DELIVERED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* DATE FILTER */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {["ALL", "TODAY", "WEEK", "MONTH"].map((d) => (
          <button
            key={d}
            onClick={() => setDateFilter(d as any)}
            className={`px-3 py-1 rounded ${
              dateFilter === d
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {d === "ALL"
              ? "ALL TIME"
              : d === "TODAY"
              ? "TODAY"
              : d === "WEEK"
              ? "THIS WEEK"
              : "THIS MONTH"}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading orders…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Delivery Fee</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders
                .filter((o) => {
                  const status =
                    o.paymentStatus === "DELIVERING"
                      ? "PROCESSING"
                      : o.paymentStatus === "COMPLETED"
                      ? "DELIVERED"
                      : o.paymentStatus;

                  if (filter !== "ALL" && status !== filter)
                    return false;

                  if (search) {
                    const q = search.toLowerCase();
                    if (
                      !o.orderId.toLowerCase().includes(q) &&
                      !o.phone.toLowerCase().includes(q)
                    )
                      return false;
                  }

                  const orderDate = new Date(o.createdAt);
                  const now = new Date();

                  if (dateFilter === "TODAY") {
                    if (
                      orderDate.toDateString() !==
                      now.toDateString()
                    )
                      return false;
                  }

                  if (dateFilter === "WEEK") {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    if (orderDate < oneWeekAgo) return false;
                  }

                  if (dateFilter === "MONTH") {
                    if (
                      orderDate.getMonth() !== now.getMonth() ||
                      orderDate.getFullYear() !==
                        now.getFullYear()
                    )
                      return false;
                  }

                  return true;
                })
                .map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">{o.orderId}</td>
                    <td className="px-4 py-3">{o.phone}</td>
                    <td className="px-4 py-3">
                      {o.amount.toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
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
                        value={o.adminNotes ?? ""}
                        onChange={(e) =>
                          setOrders((prev) =>
                            prev.map((x) =>
                              x.id === o.id
                                ? {
                                    ...x,
                                    adminNotes: e.target.value,
                                  }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="px-4 py-3 font-bold">
                      {o.paymentStatus === "DELIVERING"
                        ? "PROCESSING"
                        : o.paymentStatus === "COMPLETED"
                        ? "DELIVERED"
                        : o.paymentStatus}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {new Date(
                        o.createdAt
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      {o.paymentStatus === "PAID" && (
                        <button
                          onClick={() =>
                            updateStatus(o.id, "PROCESSING")
                          }
                        >
                          Start Processing
                        </button>
                      )}

                      {(o.paymentStatus === "DELIVERING" ||
                        o.paymentStatus === "PROCESSING") && (
                        <button
                          onClick={() =>
                            updateStatus(o.id, "DELIVERED")
                          }
                        >
                          Mark Delivered
                        </button>
                      )}
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