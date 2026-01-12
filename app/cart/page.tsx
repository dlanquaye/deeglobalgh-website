import Link from "next/link";

export default function CartPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-900">Cart</h1>

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <p className="text-gray-700">
          Cart and checkout will be available soon.
        </p>

        <p className="mt-2 text-gray-700">
          For now, you can order directly on WhatsApp.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://wa.me/233246011773"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-5 py-3 font-extrabold text-blue-950 hover:opacity-90"
          >
            Order on WhatsApp
          </a>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
