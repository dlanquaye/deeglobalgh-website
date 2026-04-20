"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

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
  const { items } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("Kasoa");
  const [location, setLocation] = useState("");

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

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

  const saveCustomerProfile = () => {
    localStorage.setItem(
      CUSTOMER_PROFILE_KEY,
      JSON.stringify({ fullName, email, phone, area, location })
    );
  };

  useEffect(() => {
    if (!currentOrderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/status?orderId=${currentOrderId}`);
        const data = await res.json();

        if (data?.paymentStatus === "PAID") {
          clearInterval(interval);
          window.location.href = `/payment-success?reference=${currentOrderId}`;
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [currentOrderId]);

  const payNowWithPaystack = async () => {
    if (!fullName.trim()) return alert("Enter full name");
    if (!email.trim()) return alert("Enter email");
    if (!phone.trim()) return alert("Enter phone");
    if (!location.trim()) return alert("Enter delivery location");
    if (items.length === 0) return alert("Cart is empty");

    saveCustomerProfile();
    setPayError(null);
    setPayLoading(true);

    try {
      const orderId = `DG-${Date.now()}`;
      setCurrentOrderId(orderId);

      const payload = {
        orderId,
        customer: { fullName, email, phone, area, location },
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.qty,
        })),
      };

      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData?.message || "Order failed");
      }

      const payRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, orderId }),
      });

      const payData = await payRes.json();
      const url = payData?.data?.authorization_url;

      if (!url) throw new Error("Payment failed");

      window.location.href = url;
    } catch (err: any) {
      setPayError(err.message);
      setPayLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-center">
      <h1 className="text-3xl font-extrabold text-blue-900">Checkout</h1>

      <section className="mt-8 rounded-2xl border bg-white p-10">
        <h2 className="text-xl font-extrabold">Customer Details</h2>

        <div className="mt-6 space-y-4 max-w-xl mx-auto">
          {fullName && (
            <p className="text-green-700 font-semibold">
              Welcome back, {fullName.split(" ")[0]} 👋
            </p>
          )}

          <input
            className="input-brand w-full text-center"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="input-brand w-full text-center"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input-brand w-full text-center"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="input-brand w-full text-center"
            placeholder="Delivery Location / Landmark"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="bg-green-100 p-3 mt-6 rounded">
          🚚 We deliver to your location. Enter a clear landmark.
        </div>
      </section>

      <section className="mt-8 bg-white p-6 rounded-2xl border">
        <button
          onClick={payNowWithPaystack}
          disabled={payLoading}
          className="w-full bg-yellow-500 py-4 font-bold rounded-xl"
        >
          {payLoading ? "Processing..." : "Pay Now"}
        </button>

        {payError && <p className="text-red-500 mt-2">{payError}</p>}
      </section>
    </main>
  );
}