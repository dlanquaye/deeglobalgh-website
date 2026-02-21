export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { reference?: string };
}) {
  const reference = searchParams.reference;

  if (!reference) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful
      </h1>

      <p className="mt-4 text-lg text-gray-700">
        Your payment has been received successfully.
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Order Reference: <span className="font-semibold">{reference}</span>
      </p>

      <p className="mt-6 text-gray-700">
        We are processing your order and will contact you shortly.
      </p>
    </main>
  );
}