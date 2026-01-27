"use client";

import { useEffect, useMemo, useState } from "react";
import { reduceStock } from "@/app/lib/inventory";
import { initInventory } from "@/app/lib/inventory";


import Link from "next/link";
import {
  loadOrders,
  updateOrderById,
  OrderStatus,
} from "@/app/lib/orders";

type Filter =
  | "ALL"
  | "PAID"
  | "PENDING"
  | "PAY_ON_DELIVERY";

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
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");

  const reload = () => setOrders(loadOrders());

  useEffect(() => {
  const session =
    typeof window !== "undefined"
      ? localStorage.getItem("dg_orders_admin_session_v1")
      : null;

  if (session === "unlocked") {
    setAuthorized(true);

    // ✅ Initialize inventory once (safe)
    initInventory().then(() => {
      reload();
    });
  }
}, []);


  // ---------- DASHBOARD METRICS ----------
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

  // ---------- FILTERED LIST ----------
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // Sort: PAID first, newest first
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

  if (!authorized) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You are not authorized to view admin orders.
        </p>
      </main>
    );
  }

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
          className="btn-outline px-4 py-2 text-sm"
        >
          Manage Products
        </Link>
      </div>

      {/* ---------- DASHBOARD SUMMARY ---------- */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-500">Total Orders</div>
          <div className="mt-1 text-2xl font-extrabold">
            {metrics.totalOrders}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-500">Paid Orders</div>
          <div className="mt-1 text-2xl font-extrabold text-green-700">
            {metrics.paidCount}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-500">Pending Orders</div>
          <div className="mt-1 text-2xl font-extrabold text-yellow-700">
            {metrics.pendingCount}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-500">
            Pay on Delivery
          </div>
          <div className="mt-1 text-2xl font-extrabold">
            {metrics.podCount}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-500">
            Revenue (Paid)
          </div>
          <div className="mt-1 text-2xl font-extrabold text-[color:var(--brand-blue)]">
            GH₵ {metrics.totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* ---------- ORDERS LIST ---------- */}
      {filteredOrders.length === 0 ? (
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
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold">Customer</div>
                    <div className="text-sm">
                      {order.customer.fullName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.customer.phone}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.customer.area} — {order.customer.location}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">Payment</div>
                    <div className="text-sm">
                      Method: {order.paymentMethod}
                    </div>
                    {order.paystackReference && (
                      <div className="text-sm text-gray-600">
                        Ref: {order.paystackReference}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t pt-3">
                  <div className="text-sm font-semibold mb-1">Items</div>
                  <ul className="text-sm text-gray-700">
                    {order.items.map((item: any) => (
                      <li key={item.id}>
                        {item.name} × {item.qty}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="font-extrabold text-[color:var(--brand-blue)]">
                      Subtotal: GH₵ {order.subtotal.toFixed(2)}
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
                </div>

                {canProgress &&
                  nextStatuses(order.orderStatus).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {nextStatuses(order.orderStatus).map((next) => (
                        <button
                          key={next}
                         onClick={() => {
  // ✅ Deduct stock once (safe)
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
