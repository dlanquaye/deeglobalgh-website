"use client";

import { useEffect, useState } from "react";
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

  // Load saved customer
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

  // Payment polling
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

  // PAYSTACK
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

  // ✅ WHATSAPP CHECKOUT
  const handleWhatsAppOrder = () => {
    if (!fullName.trim()) {
  setPayError("Please enter your full name");
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}

if (!email.trim()) {
  setPayError("Please enter your email");
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}

if (!phone.trim()) {
  setPayError("Please enter your phone number");
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}

if (!location.trim()) {
  setPayError("Please enter your delivery location");
  window.scrollTo({ top: 0, behavior: "smooth" });
  return;
}

if (items.length === 0) {
  setPayError("Your cart is empty");
  return;
}

    const orderLines = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (x${item.qty}) - GH₵ ${
            item.retailPrice * item.qty
          }`
      )
      .join("\n");

    

    const message = `Hello, I want to order:

${orderLines}

Subtotal: GH₵ ${subtotal}
Delivery: ${
  deliveryFee !== null ? `GH₵ ${deliveryFee}` : "To be confirmed"
}
Total: GH₵ ${total}

Name: ${fullName}
Phone: ${phone}
Location: ${location}
Area: ${area}`;

    const encoded = encodeURIComponent(message);

    window.open(
      `https://wa.me/233270030000?text=${encoded}`,
      "_blank"
    );
  };
const getDeliveryFee = () => {
  const loc = location.toLowerCase();

  if (loc.includes("kasoa")) return 30;

  return null; // outside Kasoa → confirm manually
};

const deliveryFee = getDeliveryFee();

const subtotal = items.reduce(
  (sum, item) => sum + item.retailPrice * item.qty,
  0
);

const total =
  deliveryFee !== null ? subtotal + deliveryFee : subtotal;

  const isKasoaLocation = location.toLowerCase().includes("kasoa");
  
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-center">
      <h1 className="text-3xl font-extrabold text-blue-900">Checkout</h1>
      {payError && (
  <div className="mt-4 bg-red-100 border border-red-500 text-red-700 p-3 rounded-lg text-sm font-semibold">
    {payError}
  </div>
)}

      {/* CUSTOMER DETAILS */}
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
            placeholder="Delivery Location (Kasoa or outside Kasoa)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="bg-green-100 p-3 mt-6 rounded">
          🚚 We deliver to your location. Enter a clear landmark.
        </div>
      </section>

      {/* ORDER SUMMARY */}
      <section className="mt-8 bg-white p-6 rounded-2xl border text-left">
        <h2 className="text-xl font-extrabold mb-4">Your Order</h2>

        
          <div className="space-y-3">
  {items.map((item) => {
    return (
      <div key={item.id} className="flex justify-between border-b pb-2">
        <span>
          {item.name} (x{item.qty})
        </span>
        <span className="font-semibold">
          GH₵ {item.retailPrice * item.qty}
        </span>
      </div>
    );
  })}
</div>

{isKasoaLocation && location && (
  <div className="mt-3 bg-green-100 border border-green-500 text-green-700 p-3 rounded-lg text-sm font-semibold">
    ✅ Fast delivery within Kasoa. Your order will be processed quickly.
  </div>
)}

{!isKasoaLocation && location && (
  <div className="mt-4 bg-red-100 border border-red-500 text-red-700 p-4 rounded-lg text-sm font-semibold">
    ⚠️ Important Notice:
    <br />
    We are located in Kasoa. Delivery outside Kasoa may cost GH₵ 50 or more depending on distance and items.
    <br />
    Please confirm delivery cost via WhatsApp before making payment.
  </div>
)}

        <div className="mt-4 text-right font-bold text-lg space-y-1">
  <div>Subtotal: GH₵ {subtotal}</div>

  <div>
    Delivery:{" "}
    {deliveryFee !== null ? `GH₵ ${deliveryFee}` : "To be confirmed"}
  </div>

  <div className="text-xl">
  {deliveryFee !== null ? "Payable Now:" : "Estimated Total:"} GH₵ {total}
</div>
</div>
      </section>

<p className="text-sm text-gray-600 mb-3">
  ⚡ Orders are processed quickly. Confirm now to avoid delays.
</p>

      {/* ACTION BUTTONS */}
      <section className="mt-8 bg-white p-6 rounded-2xl border">
        <button
          onClick={payNowWithPaystack}
          disabled={payLoading}
          className="w-full bg-yellow-500 py-4 font-bold rounded-xl"
        >
          {payLoading ? "Processing..." : "Pay Now"}
        </button>

        {/* ✅ WHATSAPP BUTTON */}
        <button
          onClick={handleWhatsAppOrder}
          className="w-full bg-green-600 text-white py-4 font-bold rounded-xl mt-4"
        >
          Order via WhatsApp (Pay on Delivery)
        </button>

        <p className="text-sm text-gray-500 mt-3">
          You can pay now or confirm your order via WhatsApp.
        </p>

        <p className="text-sm text-gray-600 mt-2">
  Prefer to confirm delivery cost first? Chat with us instantly on WhatsApp.
</p>

        {payError && <p className="text-red-500 mt-2">{payError}</p>}
      </section>
    </main>
  );
}