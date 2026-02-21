"use client";

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useState } from "react";

/**
 * This defines ONLY what the cart needs.
 * It is intentionally NOT tied to Prisma Product type
 * to avoid coupling and future breakage.
 */
type CartProductInput = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc?: string | null;
  stockQty: number;
};

type Props = {
  product: CartProductInput;
  outOfStock?: boolean;
};

export default function AddToCartButton({
  product,
  outOfStock = false,
}: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToCart = () => {
    const success = addToCart(product, 1);

    if (success) {
      setAdded(true);
      setMessage("Item added to cart.");

      setTimeout(() => {
        setMessage(null);
      }, 2000);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAddToCart}
          className={`inline-flex items-center justify-center rounded-xl px-5 py-3 font-extrabold ${
            outOfStock
              ? "cursor-not-allowed bg-gray-300 text-gray-600"
              : "bg-blue-900 text-white hover:opacity-90"
          }`}
        >
          {outOfStock ? "Out of Stock" : "Add to cart"}
        </button>

        {message && (
          <p className="text-sm font-semibold text-[color:var(--brand-blue)]">
            {message}
          </p>
        )}

        {outOfStock && (
          <p className="text-sm font-semibold text-red-600">
            This item is currently out of stock.
          </p>
        )}
      </div>

      {added && !outOfStock && (
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-extrabold text-blue-900 hover:bg-gray-50"
        >
          View Cart
        </Link>
      )}
    </div>
  );
}