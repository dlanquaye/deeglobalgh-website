"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useCart } from "@/app/context/CartContext";

function formatMoney(amount: number) {
  return `GH₵ ${amount.toFixed(0)}`;
}

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, subtotal, totalItems } = useCart();

  const lastItem = useMemo(() => {
    if (!items.length) return null;
    return items[items.length - 1];
  }, [items]);

  return (
    <>
      {/* Backdrop */}
      {open ? (
        <button
          type="button"
          aria-label="Close cart drawer"
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-black/30"
        />
      ) : null}

      {/* Drawer */}
      <aside
        className={[
          "fixed right-0 top-0 z-[80] h-full w-[92%] max-w-md bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="h-1 w-full bg-gradient-to-r from-blue-900 via-blue-700 to-yellow-500" />

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-extrabold text-blue-900">
                Added to cart ✅
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {totalItems} item{totalItems === 1 ? "" : "s"} in your cart
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm font-bold text-blue-900 hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          {/* Last added item */}
          {lastItem ? (
            <div className="mt-5 flex gap-4 rounded-2xl border bg-white p-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-white shrink-0">
                <Image
                  src={lastItem.imageSrc || "/products/placeholder.webp"}
                  alt={lastItem.name}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-bold text-blue-900 truncate">
                  {lastItem.name}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Qty: <span className="font-bold text-gray-900">{lastItem.qty}</span>
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Unit: <span className="font-bold text-gray-900">GH₵ {lastItem.price}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Summary */}
          <div className="mt-5 rounded-2xl border bg-gray-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-extrabold text-blue-900">
                {formatMoney(subtotal)}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Delivery fees depend on your location and will be confirmed at checkout.
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/cart"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-900 px-5 py-3 font-extrabold text-white hover:opacity-90"
            >
              View Cart
            </Link>

            <Link
              href="/checkout"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--brand-yellow)] px-5 py-3 font-extrabold text-blue-950 hover:opacity-90"
            >
              Proceed to Checkout
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="btn-outline w-full px-5 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
