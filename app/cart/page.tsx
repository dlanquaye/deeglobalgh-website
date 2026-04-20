"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

function formatMoney(amount: number) {
  return `GH₵ ${amount.toFixed(0)}`;
}

export default function CartPage() {
  const {
    items,
    subtotal,
    totalItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
  } = useCart();

  return (
    <main className="py-10">
      <section className="card-brand p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
              Your Cart
            </h1>
            <p className="mt-1 text-[color:var(--text-muted)]">
              Review your items before checkout.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="btn-outline px-5 py-3 text-sm text-red-600 hover:bg-red-50 border-red-200"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Empty cart */}
        {items.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-[color:var(--text-muted)]">
              Your cart is currently empty.
            </p>

            <Link
              href="/shop"
              className="btn-primary mt-6 inline-flex items-center justify-center px-6 py-3"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-5">
              {items.map((item) => {
                const imgSrc =
                  item.imageSrc || "/products/placeholder.webp";

                return (
                  <div
                    key={item.id}
                    className="card-brand p-5 flex gap-5"
                  >
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border bg-white">
                      <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[color:var(--brand-blue)]">
                        {item.name}
                      </div>

                      <div className="mt-1 text-sm text-[color:var(--text-muted)]">
                        Unit price:{" "}
                        <span className="font-semibold text-[color:var(--text-main)]">
                          GH₵ {item.retailPrice}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        {/* Quantity */}
                        <div className="inline-flex items-center gap-2 rounded-2xl border bg-white px-3 py-2">
                          <button
                            type="button"
                            onClick={() => decreaseQty(item.id)}
                            className="rounded-xl border px-3 py-1 font-extrabold hover:bg-gray-50"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <div className="min-w-[32px] text-center font-extrabold">
                            {item.qty}
                          </div>

                          <button
                            type="button"
                            onClick={() => increaseQty(item.id)}
                            className="rounded-xl border px-3 py-1 font-extrabold hover:bg-gray-50"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="btn-outline px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 border-red-200"
                        >
                          Remove
                        </button>

                        {/* Line total */}
                        <div className="ml-auto text-base font-extrabold text-[color:var(--brand-blue)]">
                          {formatMoney(item.retailPrice * item.qty)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="card-brand p-6 h-fit">
              <h2 className="text-lg font-extrabold text-[color:var(--brand-blue)]">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3 text-sm text-[color:var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Total items</span>
                  <span className="font-bold text-[color:var(--text-main)]">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-[color:var(--brand-blue)]">
                    {formatMoney(subtotal)}
                  </span>
                </div>

                <div className="pt-3 text-xs">
                  Delivery fees depend on your location and will be confirmed
                  during checkout.
                </div>
              </div>

              {/* Trust copy */}
      <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-[color:var(--text-muted)]">
  Secure checkout • Paystack recommended • Pay on delivery available within
  Kasoa and nearby areas only
</div>



              {/* Actions */}
              <Link
                href="/checkout"
                className="btn-primary mt-6 inline-flex w-full items-center justify-center px-6 py-4 text-base"
              >
                <button
  onClick={() => {
  window.location.href = "/checkout";
}}
  className="w-full rounded-lg bg-blue-900 py-3 text-white font-bold"
>
  Order via WhatsApp
</button>
              </Link>

              <Link
                href="/shop"
                className="btn-outline mt-3 inline-flex w-full items-center justify-center px-6 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
