"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { reduceStock, initInventory } from "@/app/lib/inventory";
import {
  loadOrders,
  updateOrderById,
  OrderStatus,
} from "@/app/lib/orders";

type Filter = "ALL" | "PAID" | "PENDING" | "PAY_ON_DELIVERY";

function nextStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case "PENDING":
      return ["PACKED", "CANCELLED"];
    case "PACKED":
      return ["OUT_FOR_DELIVERY"];
    case "OUT_FOR_DELIVERY":
      return ["DELIVERED"];
    default:
      return [];
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------
     INITIAL LOAD (NO CLIENT AUTH BLOCK)
  ------------------------------------------------ */
  useEffect(() => {
    const init = async () => {
      await initInventory();
      setOrders(loadOrders());
      setLoading(false);
    };

    init();
  }, []);

  const reload = () => setOrders(loadOrders());

  /* ------------------------------------------------
     DASHBOARD METRICS
  ------------------------------------------------ */
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(
      (o) => o.paymentStatus === "PAID"
    );
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "PENDING"
    );
    const podOrders = orders.filter(
      (o) => o.paymentMethod === "PAY_ON_DELIVERY"
    );
    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + (o.subtotal || 0),
      0
    );

    return {
      totalOrders,
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length,
      podCount: podOrders.length,
      totalRevenue,
    };
  }, [orders]);

  /* ------------------------------------------------
     FILTERED ORDERS
  ------------------------------------------------ */
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    list.sort((a, b) => {
      if (a.paymentStatus === "PAID" && b.paymentStatus !== "PAID")
        return -1;
      if (a.paymentStatus !== "PAID" && b.paymentStatus === "PAID")
        return 1;
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

    if (filter === "PAID")
      return list.filter((o) => o.paymentStatus === "PAID");
    if (filter === "PENDING")
      return list.filter((o) => o.orderStatus === "PENDING");
    if (filter === "PAY_ON_DELIVERY")
      return list.filter(
        (o) => o.paymentMethod === "PAY_ON_DELIVERY"
      );

    return list;
  }, [orders, filter]);

  /* ------------------------------------------------
     RENDER
  ------------------------------------------------ */
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
          Admin Orders
        </h1>

        <div className="flex gap-2">
          {(["ALL", "PAID", "PENDING", "PAY_ON_DELIVERY"] as Filter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-4 py-2 text-sm font-bold border ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {f.replaceAll("_", " ")}
              </button>
            )
          )}
        </div>

        <Link
          href="/admin/products"
          className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-gray-50"
        >
          Manage Products
        </Link>
      </div>

      {/* Dashboard */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Total Orders" value={metrics.totalOrders} />
        <Metric label="Paid Orders" value={metrics.paidCount} green />
        <Metric label="Pending Orders" value={metrics.pendingCount} yellow />
        <Metric label="Pay on Delivery" value={metrics.podCount} />
        <Metric
          label="Revenue (Paid)"
          value={`GH₵ ${metrics.totalRevenue.toFixed(2)}`}
          blue
        />
      </div>

      {/* Orders */}
      {loading ? (
        <p>Loading orders…</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const canProgress =
              order.paymentMethod === "PAY_ON_DELIVERY" ||
              order.paymentStatus === "PAID";

            const waNumber = "233246011773";
            const waText = `Hello DeeglobalGh, I am following up on my order ${order.id}.`;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
              waText
            )}`;

            return (
              <div
                key={order.id}
                className="rounded-2xl border bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-[color:var(--brand-blue)]">
                      Order {order.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <StatusBadge status={order.paymentStatus} />
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t pt-3 flex justify-between items-center">
                  <div className="font-extrabold text-[color:var(--brand-blue)]">
                    GH₵ {order.subtotal.toFixed(2)}
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                  >
                    WhatsApp Customer
                  </a>
                </div>

                {canProgress &&
                  nextStatuses(order.orderStatus).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {nextStatuses(order.orderStatus).map((next) => (
                        <button
                          key={next}
                          onClick={() => {
                            if (!order.stockDeducted) {
                              order.items.forEach((item: any) => {
                                reduceStock(item.id, item.qty);
                              });

                              updateOrderById(order.id, {
                                orderStatus: next,
                                stockDeducted: true,
                              });
                            } else {
                              updateOrderById(order.id, {
                                orderStatus: next,
                              });
                            }

                            reload();
                          }}
                          className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-gray-50"
                        >
                          Mark as {next}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

/* ------------------------------------------------
   SMALL UI HELPERS
------------------------------------------------ */
function Metric({
  label,
  value,
  green,
  yellow,
  blue,
}: {
  label: string;
  value: any;
  green?: boolean;
  yellow?: boolean;
  blue?: boolean;
}) {
  let color = "";
  if (green) color = "text-green-700";
  if (yellow) color = "text-yellow-700";
  if (blue) color = "text-[color:var(--brand-blue)]";

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${color}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        status === "PAID"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
}
