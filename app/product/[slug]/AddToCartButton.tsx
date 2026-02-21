"use client";

import { useCart } from "@/app/context/CartContext";
type CartProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc?: string | null;
  stockQty?: number;
};

import Link from "next/link";
import { useState } from "react";

type Props = {
  product: CartProduct;
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
    const success = addToCart(
  {
    id: product.id,
    name: product.name,
    retailPrice: product.retailPrice,
    slug: product.slug,
    imageSrc: product.image?.src,
    stockQty: product.stockQty ?? 0,
  },
  1
);


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

        {/* Success message (in stock only) */}
        {message && (
          <p className="text-sm font-semibold text-[color:var(--brand-blue)]">
            {message}
          </p>
        )}

        {/* Static out-of-stock message */}
        {outOfStock && (
          <p className="text-sm font-semibold text-red-600">
            This item is currently out of stock.
          </p>
        )}
      </div>

      {added && !outOfStock ? (
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
