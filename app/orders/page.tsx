"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  clearOrders,
  loadOrders,
  updateOrderById,
  type OrderRecord,
  type OrderStatus,
  type PaymentStatus,
} from "@/app/lib/orders";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function statusLabel(s: OrderStatus) {
  switch (s) {
    case "PENDING":
      return "Pending";
    case "PAID":
      return "Paid";
    case "PACKED":
      return "Packed";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return s;
  }
}

function paymentLabel(p: PaymentStatus) {
  switch (p) {
    case "UNPAID":
      return "Unpaid";
    case "PAID":
      return "Paid";
    case "UNKNOWN":
      return "Unknown";
    default:
      return p;
  }
}

// ✅ Backward compatibility: older orders created before schema update
function normalizeOrder(o: any): OrderRecord {
  const paymentMethod = o?.paymentMethod === "PAYSTACK" ? "PAYSTACK" : "PAY_ON_DELIVERY";

  return {
    ...o,
    orderStatus: (o?.orderStatus as OrderStatus) || "PENDING",
    paymentStatus:
      (o?.paymentStatus as PaymentStatus) ||
      (paymentMethod === "PAYSTACK" ? "UNKNOWN" : "UNPAID"),
  } as OrderRecord;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const refresh = () => {
    const raw = loadOrders();
    setOrders(raw.map(normalizeOrder));
  };

  useEffect(() => {
    refresh();
  }, []);

  const totalOrders = orders.length;

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  }, [orders]);

  const counts = useMemo(() => {
    const out = {
      pending: 0,
      packed: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const o of orders) {
      switch (o.orderStatus) {
        case "PENDING":
          out.pending++;
          break;
        case "PACKED":
          out.packed++;
          break;
        case "OUT_FOR_DELIVERY":
          out.outForDelivery++;
          break;
        case "DELIVERED":
          out.delivered++;
          break;
        case "CANCELLED":
          out.cancelled++;
          break;
      }
    }
    return out;
  }, [orders]);

  const setOrderStatus = (orderId: string, next: OrderStatus) => {
    updateOrderById(orderId, { orderStatus: next });
    refresh();
  };

  const setPaymentStatus = (orderId: string, next: PaymentStatus) => {
    updateOrderById(orderId, { paymentStatus: next });
    refresh();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
          Orders Log
        </h1>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="btn-outline px-4 py-2 text-sm text-[color:var(--brand-blue)]"
          >
            Home
          </Link>

          <button
            type="button"
            onClick={refresh}
            className="btn-outline px-4 py-2 text-sm text-[color:var(--brand-blue)]"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              const ok = confirm("Clear all saved orders on this device?");
              if (!ok) return;
              clearOrders();
              setOrders([]);
            }}
            className="btn-outline px-4 py-2 text-sm text-red-600 border-red-200 hover:bg-red-50"
          >
            Clear Orders
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card-brand p-5">
          <div className="text-xs text-[color:var(--text-muted)]">Total orders</div>
          <div className="mt-1 text-2xl font-extrabold text-[color:var(--brand-blue)]">
            {totalOrders}
          </div>
        </div>

        <div className="card-brand p-5 sm:col-span-3">
          <div className="text-xs text-[color:var(--text-muted)]">
            Total subtotal (this device)
          </div>
          <div className="mt-1 text-2xl font-extrabold text-[color:var(--brand-blue)]">
            GH₵ {formatMoney(totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-[color:var(--text-muted)]">
            This is saved in local storage for now (MVP). It will not sync across devices yet.
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-[color:var(--text-muted)]">Pending</div>
          <div className="text-lg font-extrabold text-[color:var(--brand-blue)]">
            {counts.pending}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-[color:var(--text-muted)]">Packed</div>
          <div className="text-lg font-extrabold text-[color:var(--brand-blue)]">
            {counts.packed}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-[color:var(--text-muted)]">Out</div>
          <div className="text-lg font-extrabold text-[color:var(--brand-blue)]">
            {counts.outForDelivery}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-[color:var(--text-muted)]">Delivered</div>
          <div className="text-lg font-extrabold text-[color:var(--brand-blue)]">
            {counts.delivered}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-[color:var(--text-muted)]">Cancelled</div>
          <div className="text-lg font-extrabold text-[color:var(--brand-blue)]">
            {counts.cancelled}
          </div>
        </div>
      </div>

      {/* Orders list */}
      <section className="mt-6 card-brand p-6">
        {orders.length === 0 ? (
          <div className="text-[color:var(--text-muted)]">No orders saved yet.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border bg-white p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-[color:var(--brand-blue)]">
                      {o.id}
                    </div>
                    <div className="text-xs text-[color:var(--text-muted)]">
                      Created: {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                    </div>
                    <div className="text-xs text-[color:var(--text-muted)]">
                      Updated: {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "—"}
                    </div>
                  </div>

                  <div className="text-sm font-extrabold text-[color:var(--brand-blue)]">
                    GH₵ {formatMoney(o.subtotal)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="text-sm">
                    <div>
                      <b>Customer:</b> {o.customer?.fullName}
                    </div>
                    <div>
                      <b>Phone:</b> {o.customer?.phone}
                    </div>
                    <div>
                      <b>Area:</b> {o.customer?.area}
                    </div>
                    <div>
                      <b>Location:</b> {o.customer?.location}
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">
                    <div className="text-xs text-[color:var(--text-muted)] font-bold">
                      Controls
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3">
                      <label className="text-xs text-[color:var(--text-muted)]">
                        Order Status
                        <select
                          value={o.orderStatus}
                          onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm font-bold"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PAID">Paid</option>
                          <option value="PACKED">Packed</option>
                          <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </label>

                      <label className="text-xs text-[color:var(--text-muted)]">
                        Payment Status
                        <select
                          value={o.paymentStatus}
                          onChange={(e) =>
                            setPaymentStatus(o.id, e.target.value as PaymentStatus)
                          }
                          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm font-bold"
                        >
                          <option value="UNKNOWN">Unknown</option>
                          <option value="UNPAID">Unpaid</option>
                          <option value="PAID">Paid</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-[color:var(--text-muted)]">
                  <b>Payment method:</b> {o.paymentMethod}
                  {o.paystackReference ? (
                    <>
                      {" "}
                      • <b>Ref:</b> {o.paystackReference}
                    </>
                  ) : null}
                  {o.paystackStatus ? (
                    <>
                      {" "}
                      • <b>Paystack status:</b> {o.paystackStatus}
                    </>
                  ) : null}
                </div>

                <div className="mt-4 border-t pt-3">
                  <div className="text-sm font-bold text-[color:var(--text-main)]">
                    Items
                  </div>

                  <div className="mt-2 space-y-2">
                    {o.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-[color:var(--text-main)] truncate">
                            {it.name}
                          </div>
                          <div className="text-xs text-[color:var(--text-muted)]">
                            Qty: {it.qty}
                          </div>
                        </div>
                        <div className="font-extrabold text-[color:var(--brand-blue)]">
                          GH₵ {formatMoney(it.price * it.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badge */}
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-extrabold text-[color:var(--brand-blue)]">
                    {statusLabel(o.orderStatus)} • {paymentLabel(o.paymentStatus)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
