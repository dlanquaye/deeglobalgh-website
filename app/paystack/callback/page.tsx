import Link from "next/link";
import PaystackSuccessClient from "./PaystackSuccessClient";
import PaystackFailureClient from "./PaystackFailureClient";
import OrderSummaryClient from "./OrderSummaryClient";

type Props = {
  searchParams: Promise<{ reference?: string }>;
};

async function verify(reference: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(
    `${siteUrl}/api/paystack/verify?reference=${encodeURIComponent(reference)}`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function PaystackCallbackPage({ searchParams }: Props) {
  const { reference } = await searchParams;

  if (!reference) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Payment Error</h1>
        <p>Missing transaction reference.</p>
        <Link href="/">Go Home</Link>
      </div>
    );
  }

  const result = await verify(reference);
  const status = result?.data?.status || "unknown";

  return (
    <div style={{ padding: 24 }}>
      <h1>Payment Callback</h1>

      <p>
        <b>Reference:</b> {reference}
      </p>
      <p>
        <b>Verification status:</b> {status}
      </p>

      {status === "success" ? (
        <>
          <PaystackSuccessClient reference={reference} status={status} />

          {/* ✅ Order Summary */}
          <OrderSummaryClient />

          <h2 style={{ marginTop: 16 }}>Payment Confirmed ✅</h2>
          <p>Your payment has been verified successfully.</p>
          <p style={{ marginTop: 8 }}>
            We are opening WhatsApp now so you can send your order confirmation.
          </p>

          <Link href="/" style={{ display: "inline-block", marginTop: 16 }}>
            Continue shopping
          </Link>
        </>
      ) : (
        <>
          {/* ✅ Mark Paystack order as failed/abandoned/unknown */}
          <PaystackFailureClient reference={reference} status={status} />

          <h2>Payment Not Confirmed</h2>
          <p>
            We could not confirm payment yet. If you paid, please wait and
            refresh.
          </p>

          <Link href="/" style={{ display: "inline-block", marginTop: 16 }}>
            Go Home
          </Link>
        </>
      )}
    </div>
  );
}
