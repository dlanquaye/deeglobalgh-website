"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";

type CartProductInput = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc?: string;
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

  const handleAdd = () => {
    if (outOfStock) return;

    const success = addToCart(product, 1);

    if (success) {
      setAdded(true);
      setMessage("Item added to cart.");

      setTimeout(() => {
        setMessage(null);
      }, 2000);
    } else {
      setMessage("Unable to add item. Check stock.");
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className={`rounded-xl px-5 py-3 font-bold ${
            outOfStock
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-900 text-white hover:opacity-90"
          }`}
        >
          {outOfStock ? "Out of Stock" : "Add to cart"}
        </button>

        {message && (
          <p className="text-sm font-semibold text-blue-900">
            {message}
          </p>
        )}
      </div>

      {added && !outOfStock && (
        <Link
          href="/cart"
          className="rounded-xl border px-5 py-3 font-bold text-blue-900 hover:bg-gray-50"
        >
          View Cart
        </Link>
      )}
    </div>
  );
}