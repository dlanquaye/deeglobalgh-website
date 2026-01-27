"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { addOrder, generateOrderId } from "@/app/lib/orders";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const PAYSTACK_ORDER_SNAPSHOT_KEY = "dg_paystack_order_snapshot_v1";
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
  const [notes, setNotes] = useState("");

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
    setNotes(saved.notes || "");
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
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        area,
        location: location.trim(),
        notes: notes.trim(),
      })
    );
  };

  const savePaystackSnapshot = (orderId: string) => {
    localStorage.setItem(
      PAYSTACK_ORDER_SNAPSHOT_KEY,
      JSON.stringify({
        orderId,
        customer: {
          fullName,
          email,
          phone,
          area,
          location,
          notes,
        },
        items,
        subtotal,
        createdAt: new Date().toISOString(),
      })
    );
  };

  const saveOrderRecord = (
    paymentMethod: "PAYSTACK" | "PAY_ON_DELIVERY",
    orderId: string
  ) => {
    addOrder({
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        area,
        location: location.trim(),
        notes: notes.trim(),
      },
      items,
      subtotal,
      paymentMethod,
      orderStatus: "PENDING",
      paymentStatus: paymentMethod === "PAYSTACK" ? "UNKNOWN" : "UNPAID",
    });
  };

  const payNowWithPaystack = async () => {
    if (!canCheckout) return;

    saveCustomerProfile();

    const orderId = generateOrderId();
    saveOrderRecord("PAYSTACK", orderId);
    savePaystackSnapshot(orderId);

    try {
      setPayError(null);
      setPayLoading(true);

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          amount: subtotal,
        }),
      });

      const data = await res.json();
      const url = data?.data?.authorization_url;

      if (!res.ok || !url) {
        throw new Error(data?.error || "Failed to start payment");
      }

      window.location.href = url;
    } catch (err: any) {
      setPayError(err?.message || "Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">Customer Details</h2>

          <div className="mt-4 grid gap-3">
            <input
              className="input-brand"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              className="input-brand"
              placeholder="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input-brand"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="input-brand"
              placeholder="Location / Landmark"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <button
            onClick={payNowWithPaystack}
            disabled={!canCheckout || payLoading}
            className="w-full rounded-2xl bg-yellow-500 py-4 font-extrabold"
          >
            {payLoading ? "Starting Payment..." : "Pay Now (Paystack)"}
          </button>

          {payError && (
            <div className="mt-3 text-sm font-semibold text-red-600">
              {payError}
            </div>
          )}

          <button
            onClick={clearCart}
            className="btn-outline mt-4 w-full py-3 text-sm"
          >
            Clear cart
          </button>
        </section>
      </div>
    </main>
  );
}
