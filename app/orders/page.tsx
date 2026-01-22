"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clearOrders, loadOrders, type OrderRecord } from "@/app/lib/orders";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  const totalOrders = orders.length;

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  }, [orders]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
          Orders Log
        </h1>

        <div className="flex gap-2">
          <Link
            href="/"
            className="btn-outline px-4 py-2 text-sm text-[color:var(--brand-blue)]"
          >
            Home
          </Link>

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

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-brand p-5">
          <div className="text-xs text-[color:var(--text-muted)]">Total orders</div>
          <div className="mt-1 text-2xl font-extrabold text-[color:var(--brand-blue)]">
            {totalOrders}
          </div>
        </div>

        <div className="card-brand p-5 sm:col-span-2">
          <div className="text-xs text-[color:var(--text-muted)]">
            Total subtotal (this device)
          </div>
          <div className="mt-1 text-2xl font-extrabold text-[color:var(--brand-blue)]">
            GH₵ {formatMoney(totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-[color:var(--text-muted)]">
            Note: this is saved in local storage for now (MVP). It will not sync
            across devices yet.
          </div>
        </div>
      </div>

      <section className="mt-6 card-brand p-6">
        {orders.length === 0 ? (
          <div className="text-[color:var(--text-muted)]">
            No orders saved yet.
          </div>
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
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-sm font-extrabold text-[color:var(--brand-blue)]">
                    GH₵ {formatMoney(o.subtotal)}
                  </div>
                </div>

                <div className="mt-3 text-sm">
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

                <div className="mt-3 text-xs text-[color:var(--text-muted)]">
                  <b>Payment:</b> {o.paymentMethod}
                  {o.paystackReference ? (
                    <>
                      {" "}
                      • <b>Ref:</b> {o.paystackReference}
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
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
