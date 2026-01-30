"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const CUSTOMER_PROFILE_KEY = "dg_customer_v1";
const SNAPSHOT_KEY = "dg_paystack_order_snapshot_v1";

type CustomerProfile = {
  fullName: string;
  email: string;
  phone: string;
  area: string;
  location: string;
  notes?: string;
};

function safeParse<T>(raw: string | null): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("Kasoa");
  const [location, setLocation] = useState("");

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const saved = safeParse<CustomerProfile>(
      typeof window !== "undefined"
        ? localStorage.getItem(CUSTOMER_PROFILE_KEY)
        : null
    );

    if (!saved) return;

    setFullName(saved.fullName || "");
    setEmail(saved.email || "");
    setPhone(saved.phone || "");
    setLocation(saved.location || "");
    if (saved.area) setArea(saved.area);
  }, []);

  const canCheckout = useMemo(() => {
    return (
      items.length > 0 &&
      fullName.trim() &&
      email.trim() &&
      phone.trim() &&
      location.trim()
    );
  }, [items.length, fullName, email, phone, location]);

  const saveCustomerProfile = () => {
    localStorage.setItem(
      CUSTOMER_PROFILE_KEY,
      JSON.stringify({
        fullName,
        email,
        phone,
        area,
        location,
      })
    );
  };

  const payNowWithPaystack = async () => {
    if (!canCheckout) return;

    saveCustomerProfile();
    setPayError(null);
    setPayLoading(true);

    try {
      /* ===============================
         1. CREATE ORDER ON SERVER
         =============================== */
      const orderId = `DG-${Date.now()}`;

      const snapshot = {
  orderId,
  customer: { fullName, email, phone, area, location },
  amount: subtotal, // ✅ REQUIRED BY API
};


      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));

      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });

      if (!createRes.ok) {
        throw new Error("Failed to create order");
      }

      /* ===============================
         2. START PAYSTACK PAYMENT
         =============================== */
      const payRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          amount: subtotal,
          orderId,
        }),
      });

      const payData = await payRes.json();
      const url = payData?.data?.authorization_url;

      if (!payRes.ok || !url) {
        throw new Error("Failed to start payment");
      }

      window.location.href = url;
    } catch (err: any) {
      setPayError(err?.message || "Payment failed");
      setPayLoading(false);
    }
  };

  const orderViaWhatsApp = () => {
    if (!canCheckout) return;

    saveCustomerProfile();

    const orderId = `DG-${Date.now()}`;

    const message = `Hello DeeglobalGh,

I want to place an order via WhatsApp.

Order ID: ${orderId}

Items:
${items
  .map(
    (i) =>
      `- ${i.name} × ${i.qty} — GHS ${formatMoney(i.price * i.qty)}`
  )
  .join("\n")}

Subtotal: GHS ${formatMoney(subtotal)}

Delivery Area: ${area}
Location / Landmark: ${location}

Please confirm availability and delivery.
Thank you.`;

    window.open(
      `https://wa.me/233246011773?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-center">
      <h1 className="text-3xl font-extrabold text-[color:var(--brand-blue)]">
        Checkout
      </h1>

      {/* Customer Details */}
      <section className="mt-8 rounded-2xl border bg-white p-10">
        <h2 className="text-xl font-extrabold">Customer Details</h2>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
          <div className="sm:col-span-2">
            <input
              className="input-brand h-14 px-4 text-base w-full text-center"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="email"
              className="input-brand h-14 px-4 text-base w-full text-center"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <input
            className="input-brand h-14 px-4 text-base w-full text-center"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="input-brand h-14 px-4 text-base w-full text-center"
            placeholder="Location / Landmark"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </section>

      {/* Payment Options */}
      <section className="mt-8 rounded-2xl border bg-white p-8 space-y-6">
        <button
          onClick={payNowWithPaystack}
          disabled={!canCheckout || payLoading}
          className="w-full rounded-2xl bg-yellow-500 py-4 text-lg font-extrabold text-blue-950"
        >
          {payLoading ? "Starting Payment..." : "Pay Now (Paystack)"}
        </button>

        {payError && (
          <p className="text-sm font-semibold text-red-600">{payError}</p>
        )}

        <hr />

        <button
          onClick={orderViaWhatsApp}
          disabled={!canCheckout}
          className="w-full rounded-2xl border-2 border-green-700 py-4 text-lg font-extrabold text-green-800"
        >
          Order via WhatsApp (Pay on Delivery)
        </button>

        <button
          onClick={clearCart}
          className="mt-2 w-full text-sm font-semibold text-red-600 hover:underline"
        >
          Clear cart
        </button>
      </section>
    </main>
  );
}
