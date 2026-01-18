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
  const { items, subtotal, totalItems, increaseQty, decreaseQty, removeFromCart, clearCart } =
    useCart();

  const whatsappMessage = useMemo(() => {
    if (!items.length) return "";

    const lines = items.map((x, index) => {
      const lineTotal = x.price * x.qty;
      return `${index + 1}. ${x.name}\n   Qty: ${x.qty}\n   Price: GH₵ ${
        x.price
      }\n   Total: GH₵ ${lineTotal}`;
    });

    const msg = [
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

    return msg;
  }, [items, subtotal]);

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-blue-900">Your Cart</h1>

      <p className="mt-2 text-gray-700">
        Review your items and place your delivery order.
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6">
          <p className="text-gray-700">Your cart is empty.</p>

          <Link
            href="/shop"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 font-extrabold text-white hover:opacity-90"
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
                <div
                  key={item.id}
                  className="rounded-2xl border bg-white p-4 flex gap-4"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-gray-50 shrink-0">
                    <Image
                      src={imgSrc}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-blue-900 truncate">
                      {item.name}
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      Unit price: <span className="font-semibold">GH₵ {item.price}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {/* Qty controls */}
                      <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2">
                        <button
                          type="button"
                          onClick={() => decreaseQty(item.id)}
                          className="rounded-lg border px-3 py-1 font-extrabold hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <div className="min-w-[32px] text-center font-bold">
                          {item.qty}
                        </div>

                        <button
                          type="button"
                          onClick={() => increaseQty(item.id)}
                          className="rounded-lg border px-3 py-1 font-extrabold hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-xl border px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>

                      <div className="ml-auto text-sm font-extrabold text-blue-900">
                        {formatMoney(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="rounded-2xl border bg-white p-6 h-fit">
            <div className="text-lg font-extrabold text-blue-900">
              Order Summary
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Items</span>
                <span className="font-bold">{totalItems}</span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-extrabold text-blue-900">
                  {formatMoney(subtotal)}
                </span>
              </div>

              <div className="pt-3 text-xs text-gray-500">
                Delivery fees depend on your location. Confirm on WhatsApp.
              </div>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-yellow-500 px-5 py-3 font-extrabold text-blue-950 hover:opacity-90"
            >
              Order on WhatsApp
            </a>

            <Link
              href="/shop"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 font-bold hover:bg-gray-50"
            >
              Continue Shopping
            </Link>

            <button
              type="button"
              onClick={clearCart}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-red-200 px-5 py-3 font-bold text-red-600 hover:bg-red-50"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
