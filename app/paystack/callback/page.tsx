import Link from "next/link";
import PaystackSuccessClient from "./PaystackSuccessClient";
import PaystackFailureClient from "./PaystackFailureClient";
import OrderSummaryClient from "./OrderSummaryClient";

type Props = {
  searchParams: Promise<{ reference?: string }>;
};

async function verify(reference: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(
    `${siteUrl}/api/paystack/verify?reference=${encodeURIComponent(reference)}`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function PaystackCallbackPage({
  searchParams,
}: Props) {
  const { reference } = await searchParams;

  if (!reference) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-bold">Payment Error</h1>
        <p className="mt-2 text-sm text-gray-700">
          Missing transaction reference. No payment was processed.
        </p>

        <Link
          href="/"
          className="mt-4 inline-block rounded border px-4 py-2"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  const result = await verify(reference);
  const status = result?.data?.status || "unknown";

  return (
    <main className="mx-auto max-w-2xl p-6">
      {status === "success" ? (
        <>
          {/* ✅ SINGLE SOURCE OF SUCCESS UX */}
          <PaystackSuccessClient
            reference={reference}
            status={status}
          />

          {/* ✅ ORDER SUMMARY (READ-ONLY) */}
          <OrderSummaryClient />

          <div className="mt-6">
            <Link
              href="/"
              className="inline-block rounded border px-4 py-2"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      ) : (
        <>
          {/* ❌ FAILURE / CANCELLED / UNKNOWN */}
          <PaystackFailureClient
            reference={reference}
            status={status}
          />

          <h2 className="mt-6 text-lg font-bold">
            Payment Not Confirmed
          </h2>

          <p className="mt-2 text-sm text-gray-700">
            Your payment could not be confirmed at this time.
            If you were debited, please wait a few minutes and
            contact us on WhatsApp.
          </p>

          <div className="mt-4 flex gap-3">
            <Link
              href="/"
              className="rounded border px-4 py-2"
            >
              Back to Home
            </Link>

            <Link
              href="https://wa.me/233246011773"
              className="rounded bg-green-600 px-4 py-2 text-white"
            >
              Contact WhatsApp
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
