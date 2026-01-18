"use client";

import { useCart } from "@/app/context/CartContext";
import type { Product } from "@/app/lib/products";
import Link from "next/link";
import { useState } from "react";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => {
          addToCart(product, 1);
          setAdded(true);
        }}
        className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 font-extrabold text-white hover:opacity-90"
      >
        Add to cart
      </button>

      {added ? (
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-extrabold text-blue-900 hover:bg-gray-50"
        >
          View Cart
        </Link>
      ) : null}
    </div>
  );
}
