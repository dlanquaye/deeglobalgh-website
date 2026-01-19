"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useCart } from "@/app/context/CartContext";

const WHATSAPP_NUMBER = "233246011773";

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

  const whatsappMessage = useMemo(() => {
    if (!items.length) return "";

    const lines = items.map((x, index) => {
      const lineTotal = x.price * x.qty;
      return `${index + 1}. ${x.name}\n   Qty: ${x.qty}\n   Price: GH₵ ${
        x.price
      }\n   Total: GH₵ ${lineTotal}`;
    });

    return [
      "Hello DeeglobalGh, I want to order the following items:",
      "",
      ...lines,
      "",
      `Subtotal: ${formatMoney(subtotal)}`,
      "",
      "Delivery Details:",
      "• Name:",
      "• Location:",
      "• Landmark:",
      "",
      "SOURCE: DG-WEBSITE",
    ].join("\n");
  }, [items, subtotal]);

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <main className="py-6">
      <section className="card-brand p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
              Your Cart
            </h1>
            <p className="mt-2 text-[color:var(--text-muted)]">
              Review your items and place your delivery order.
            </p>
          </div>

          {items.length > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="btn-outline px-5 py-3 text-sm text-red-600 hover:bg-red-50 border-red-200"
            >
              Clear Cart
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-6 card-brand p-6">
            <p className="text-[color:var(--text-muted)]">Your cart is empty.</p>

            <Link
              href="/shop"
              className="btn-primary mt-4 inline-flex items-center justify-center px-5 py-3"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const imgSrc = item.imageSrc || "/products/placeholder.webp";

                return (
                  <div key={item.id} className="card-brand p-4 flex gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border bg-white shrink-0">
                      <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[color:var(--brand-blue)] truncate">
                        {item.name}
                      </div>

                      <div className="mt-1 text-sm text-[color:var(--text-muted)]">
                        Unit price:{" "}
                        <span className="font-semibold text-[color:var(--text-main)]">
                          GH₵ {item.price}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {/* Qty controls */}
                        <div className="inline-flex items-center gap-2 rounded-2xl border bg-white px-3 py-2">
                          <button
                            type="button"
                            onClick={() => decreaseQty(item.id)}
                            className="rounded-xl border px-3 py-1 font-extrabold hover:bg-gray-50"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <div className="min-w-[32px] text-center font-extrabold text-[color:var(--text-main)]">
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

                        <div className="ml-auto text-sm font-extrabold text-[color:var(--brand-blue)]">
                          {formatMoney(item.price * item.qty)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="card-brand p-6 h-fit">
              <div className="text-lg font-extrabold text-[color:var(--brand-blue)]">
                Order Summary
              </div>

              <div className="mt-4 space-y-2 text-sm text-[color:var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Items</span>
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

                <div className="pt-3 text-xs text-[color:var(--text-muted)]">
                  Delivery fees depend on your location. Confirm on WhatsApp.
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--brand-yellow)] px-5 py-3 font-extrabold text-blue-950 hover:opacity-90"
              >
                Order on WhatsApp
              </a>

              <Link
                href="/shop"
                className="btn-outline mt-3 inline-flex w-full items-center justify-center px-5 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
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
