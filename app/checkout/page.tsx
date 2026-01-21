"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const PAYSTACK_ORDER_SNAPSHOT_KEY = "dg_paystack_order_snapshot_v1";

function buildWhatsAppMessage(args: {
  name: string;
  phone: string;
  location: string;
  area: string;
  notes: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
}) {
  const { name, phone, location, area, notes, items, subtotal } = args;

  const lines: string[] = [];

  lines.push("Hello DeeglobalGh, I want to place an order for delivery.");
  lines.push("");
  lines.push("CUSTOMER DETAILS");
  lines.push(`Name: ${name}`);
  lines.push(`Phone: ${phone}`);
  lines.push(`Delivery Area: ${area}`);
  lines.push(`Location/Landmark: ${location}`);

  if (notes.trim()) {
    lines.push(`Notes: ${notes.trim()}`);
  }

  lines.push("");
  lines.push("ORDER ITEMS");

  items.forEach((x, idx) => {
    lines.push(`${idx + 1}. ${x.name}  x${x.qty}  (GH₵ ${formatMoney(x.price)})`);
  });

  lines.push("");
  lines.push(`SUBTOTAL: GH₵ ${formatMoney(subtotal)}`);
  lines.push("");
  lines.push("Please confirm availability and delivery cost. Thank you.");

  return lines.join("\n");
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("Kasoa");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const canCheckout = useMemo(() => {
    if (!items.length) return false;
    if (!fullName.trim()) return false;
    if (!phone.trim()) return false;
    if (!location.trim()) return false;
    return true;
  }, [items.length, fullName, phone, location]);

  // ✅ This will allow callback page to show summary after Paystack payment
  const savePaystackSnapshot = () => {
    const snapshot = {
      customer: {
        fullName,
        phone,
        area,
        location,
        notes,
      },
      items: items.map((x) => ({
        id: x.id,
        name: x.name,
        qty: x.qty,
        price: x.price,
      })),
      subtotal,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(PAYSTACK_ORDER_SNAPSHOT_KEY, JSON.stringify(snapshot));
  };

  const placeOrder = () => {
    if (!canCheckout) return;

    const msg = buildWhatsAppMessage({
      name: fullName,
      phone,
      location,
      area,
      notes,
      items: items.map((x) => ({
        name: x.name,
        qty: x.qty,
        price: x.price,
      })),
      subtotal,
    });

    const waNumber = "233246011773";
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank", "noreferrer");
  };

  const payNowWithPaystack = async () => {
    if (!canCheckout) return;

    try {
      setPayError(null);
      setPayLoading(true);

      // 1) Save snapshot for callback summary
      savePaystackSnapshot();

      // 2) Initialize Paystack transaction
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: phone?.trim()
            ? `${phone.trim()}@shopdeeglobalgh.com`
            : "customer@shopdeeglobalgh.com",
          amount: subtotal, // GHS
        }),
      });

      const data = await res.json();
      const url = data?.data?.authorization_url as string | undefined;

      if (!res.ok || !url) {
        throw new Error(
          data?.error || data?.message || "Failed to initialize payment."
        );
      }

      // 3) Redirect user to Paystack checkout
      window.location.href = url;
    } catch (e: any) {
      setPayError(e?.message || "Something went wrong starting payment.");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
          Checkout
        </h1>

        <Link
          href="/cart"
          className="btn-outline px-4 py-2 text-sm text-[color:var(--brand-blue)]"
        >
          Back to Cart
        </Link>
      </div>

      {/* Trust */}
      <div className="mt-4 rounded-2xl border bg-white p-5">
        <div className="font-semibold text-[color:var(--text-main)]">
          Delivery Orders Only
        </div>
        <div className="mt-1 text-sm text-[color:var(--text-muted)]">
          Fill your details and send your order on WhatsApp for fast delivery in
          Kasoa and beyond.
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Customer form */}
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold text-[color:var(--text-main)]">
            Customer Details
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <input
              className="input-brand w-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              className="input-brand w-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <select
              className="input-brand w-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              <option value="Kasoa">Kasoa</option>
              <option value="Accra">Accra</option>
              <option value="Tema">Tema</option>
              <option value="Other">Other</option>
            </select>

            <input
              className="input-brand w-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Location / Landmark (e.g. Kasoa Nyanyano Road...)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <textarea
              className="input-brand w-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Extra notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </section>

        {/* Order summary */}
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold text-[color:var(--text-main)]">
            Order Summary
          </h2>

          <div className="mt-4 space-y-3">
            {items.length ? (
              items.map((x) => (
                <div
                  key={x.id}
                  className="flex items-start justify-between gap-3 border-b pb-3"
                >
                  <div>
                    <div className="font-semibold text-[color:var(--text-main)]">
                      {x.name}
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)]">
                      Qty: {x.qty}
                    </div>
                  </div>

                  <div className="font-extrabold text-[color:var(--brand-blue)]">
                    GH₵ {formatMoney(x.price * x.qty)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[color:var(--text-muted)]">
                Your cart is empty.
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="font-semibold text-[color:var(--text-main)]">
                Subtotal
              </div>
              <div className="text-xl font-extrabold text-[color:var(--brand-blue)]">
                GH₵ {formatMoney(subtotal)}
              </div>
            </div>

            {/* WhatsApp Order */}
            <button
              onClick={placeOrder}
              disabled={!canCheckout}
              className={`mt-4 w-full rounded-2xl px-5 py-4 text-center text-base font-extrabold ${
                canCheckout
                  ? "bg-green-600 text-white hover:opacity-90"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Order on WhatsApp (Pay on Delivery)
            </button>

            {/* Pay Now with Paystack */}
            <button
              type="button"
              onClick={payNowWithPaystack}
              disabled={!canCheckout || payLoading}
              className={`mt-3 w-full rounded-2xl px-5 py-4 text-center text-base font-extrabold ${
                !canCheckout || payLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 text-black hover:opacity-90"
              }`}
            >
              {payLoading ? "Starting Payment..." : "Pay Now (MoMo/Card) — Paystack"}
            </button>

            {payError ? (
              <div className="mt-2 text-sm font-semibold text-red-600">
                {payError}
              </div>
            ) : null}

            {/* Clear cart */}
            <button
              type="button"
              onClick={clearCart}
              className="btn-outline mt-3 w-full px-5 py-3 text-sm text-[color:var(--brand-blue)] hover:bg-gray-50"
            >
              Clear cart
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
