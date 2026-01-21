import Link from "next/link";

type Props = {
  searchParams: Promise<{ reference?: string }>;
};

async function verify(reference: string) {
  const res = await fetch(
    `http://localhost:3000/api/paystack/verify?reference=${encodeURIComponent(reference)}`,
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

  const status = result?.data?.status;

  return (
    <div style={{ padding: 24 }}>
      <h1>Payment Callback</h1>

      <p><b>Reference:</b> {reference}</p>
      <p><b>Verification status:</b> {status || "unknown"}</p>

      {status === "success" ? (
        <>
          <h2>Payment Confirmed ✅</h2>
          <p>Your payment has been verified successfully.</p>
          <Link href="/">Continue shopping</Link>
        </>
      ) : (
        <>
          <h2>Payment Not Confirmed</h2>
          <p>
            We could not confirm payment yet. If you paid, please wait and refresh.
          </p>
          <Link href="/">Go Home</Link>
        </>
      )}
    </div>
  );
}
