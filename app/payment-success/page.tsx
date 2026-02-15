export const dynamic = "force-dynamic";

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (reference) {
      fetch(`/api/paystack/verify?reference=${reference}`, {
        cache: "no-store",
      });
    }
  }, [searchParams]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold text-green-700">
        Payment Successful
      </h1>

      <p className="mt-4 text-lg font-semibold">
        Thank you for your order.
      </p>

      <p className="mt-2 text-base text-gray-700">
        Your payment has been received successfully.
        Our team will contact you shortly to confirm delivery.
      </p>

      <div className="mt-8 rounded-2xl border bg-white p-6 space-y-4">
        <p className="text-sm font-semibold">
          📦 Delivery Information
        </p>

        <p className="text-sm text-gray-700">
          We deliver across Kasoa and nearby areas.
          Please keep your phone available for confirmation.
        </p>

        <p className="text-sm text-gray-700">
          Need help? Contact us on WhatsApp:
        </p>

        <a
          href="https://wa.me/233246011773"
          target="_blank"
          className="inline-block rounded-xl bg-green-600 px-6 py-3 text-white font-bold"
        >
          Chat on WhatsApp
        </a>
      </div>
    </main>
  );
}
