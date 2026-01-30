"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { addOrder, generateOrderId } from "@/app/lib/orders";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const CUSTOMER_PROFILE_KEY = "dg_customer_v1";

type CustomerProfile = {
  fullName: string;
  email: string;
  phone: string;
  area: string;
  location: string;
  notes: string;
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

    const orderId = generateOrderId();
    addOrder({
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: { fullName, phone, area, location },
      items,
      subtotal,
      paymentMethod: "PAYSTACK",
      orderStatus: "PENDING",
      paymentStatus: "UNKNOWN",
    });

    try {
      setPayError(null);
      setPayLoading(true);

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          amount: subtotal,
        }),
      });

      const data = await res.json();
      const url = data?.data?.authorization_url;

      if (!res.ok || !url) {
        throw new Error("Failed to start payment");
      }

      window.location.href = url;
    } catch (err: any) {
      setPayError(err?.message || "Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  const orderViaWhatsApp = () => {
    if (!canCheckout) return;

    saveCustomerProfile();

    const orderId = generateOrderId();
    addOrder({
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: { fullName, phone, area, location },
      items,
      subtotal,
      paymentMethod: "PAY_ON_DELIVERY",
      orderStatus: "PENDING",
      paymentStatus: "UNPAID",
    });

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

    const phoneNumber = "0246011773";
    window.open(
      `https://wa.me/233${phoneNumber.substring(
        1
      )}?text=${encodeURIComponent(message)}`,
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

        <h2 className="text-xl font-extrabold">
          Customer Details
        </h2>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          Enter your delivery information.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-3xl mx-auto">



         <div className="sm:col-span-2 text-center">
  <label className="mb-1 block text-sm font-semibold">
    Full Name
  </label>
  <input
    className="input-brand h-14 px-4 text-base w-full text-center"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
  />
</div>


          <div className="sm:col-span-2 text-center">
  <label className="mb-1 block text-sm font-semibold">
    Email Address
  </label>
  <input
    type="email"
    className="input-brand h-14 px-4 text-base w-full text-center"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>



          <div className="text-center">
  <label className="mb-1 block text-sm font-semibold">
    Phone Number
  </label>
  <input
    className="input-brand h-14 px-4 text-base w-full text-center"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
  />
</div>



          <div className="text-center">
  <label className="mb-1 block text-sm font-semibold">
    Location / Landmark
  </label>
  <input
    className="input-brand h-14 px-4 text-base w-full text-center"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
  />
</div>

        </div>
      </section>

      {/* Payment Options */}
      <section className="mt-8 rounded-2xl border bg-white p-8 space-y-6">
        {/* Paystack */}
        <div>
          <button
            onClick={payNowWithPaystack}
            disabled={!canCheckout || payLoading}
            className="w-full rounded-2xl bg-yellow-500 py-4 text-lg font-extrabold text-blue-950 hover:bg-yellow-400"
          >
            {payLoading ? "Starting Payment..." : "Pay Now (Paystack)"}
          </button>

          <p className="mt-2 text-center text-sm font-semibold text-green-700">
            Recommended option • Guaranteed order
          </p>

          {payError && (
            <p className="mt-2 text-sm font-semibold text-red-600 text-center">
              {payError}
            </p>
          )}
        </div>

        <hr />

        {/* WhatsApp */}
        <div>
          <button
            onClick={orderViaWhatsApp}
            disabled={!canCheckout}
            className="w-full rounded-2xl border-2 border-green-700 py-4 text-lg font-extrabold text-green-800 hover:bg-green-50"
          >
            Order via WhatsApp (Pay on Delivery)
          </button>

          <p className="mt-2 text-center text-sm text-[color:var(--text-muted)]">
  Pay on delivery is available only within Kasoa and nearby areas.
  For other locations, secure payment via Paystack is required.
</p>

        </div>

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
