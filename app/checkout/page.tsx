"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

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
};

function safeParse<T>(raw: string | null): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

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

  /* =====================================================
     PAYSTACK FLOW (FIXED — NOW SENDS ITEMS)
  ===================================================== */
  const payNowWithPaystack = async () => {
    if (!canCheckout) return;

    saveCustomerProfile();
    setPayError(null);
    setPayLoading(true);

    try {
      const orderId = `DG-${Date.now()}`;

      /* 🔐 CORRECT SNAPSHOT STRUCTURE */
      const payload = {
        orderId,
        customer: {
          fullName,
          email,
          phone,
          area,
          location,
        },
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.qty,
        })),
      };

      /* 1️⃣ CREATE ORDER */
      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData?.error || "Failed to create order");
      }

      /* 2️⃣ INITIALIZE PAYSTACK */
      const payRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          amount: createData.amount, // use server-calculated amount
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

  /* ===================================================== */

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-center">
      <h1 className="text-3xl font-extrabold text-[color:var(--brand-blue)]">
        Checkout
      </h1>

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

      <section className="mt-8 rounded-2xl border bg-white p-8 space-y-6">
        <button
          onClick={payNowWithPaystack}
          disabled={!canCheckout || payLoading}
          className="w-full rounded-2xl bg-yellow-500 py-4 text-lg font-extrabold text-blue-950"
        >
          {payLoading ? "Starting Payment..." : "Pay Now (Paystack)"}
        </button>

        <p className="text-sm font-medium text-gray-700">
          🚚 We deliver across Kasoa and nearby areas. Our team will call to confirm delivery.
        </p>

        {payError && (
          <p className="text-sm font-semibold text-red-600">{payError}</p>
        )}

        <hr />

        <Link
          href="/cart"
          className="block text-sm font-semibold text-[color:var(--brand-blue)] underline"
        >
          Edit Order
        </Link>
      </section>
    </main>
  );
}
