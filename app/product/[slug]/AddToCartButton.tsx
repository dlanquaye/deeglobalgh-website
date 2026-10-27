"use client";

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useState } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

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
  comingSoon?: boolean;
};

export default function AddToCartButton({
  product,
  outOfStock = false,
  comingSoon = false,
}: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const unavailable =
    comingSoon || outOfStock || product.stockQty <= 0;

  const handleAddToCart = () => {
    if (unavailable) {
      setMessage(
        comingSoon
          ? "This textbook is coming soon."
          : "This item is currently unavailable."
      );
      return;
    }

    const success = addToCart({
      id: product.id,
      name: product.name,
      retailPrice: product.retailPrice,
      slug: product.slug,
      imageSrc: product.imageSrc,
      stockQty: product.stockQty,
    });

    if (success) {
      if (window.fbq) {
        window.fbq("track", "AddToCart", {
          content_ids: [product.id],
          content_name: product.name,
          content_type: "product",
          content_url: `https://www.shopdeeglobalgh.com/product/${product.slug}`,
          value: product.retailPrice,
          currency: "GHS",
        });
      }

      setAdded(true);
      setMessage("Item added to cart.");

      setTimeout(() => {
        setMessage(null);
      }, 2000);
    } else {
      setMessage("Unable to add item to cart. Please refresh.");
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={unavailable}
          onClick={handleAddToCart}
          className={`inline-flex items-center justify-center rounded-xl px-5 py-3 font-extrabold ${
            unavailable
              ? "cursor-not-allowed bg-gray-300 text-gray-600"
              : "bg-blue-900 text-white hover:opacity-90"
          }`}
        >
          {comingSoon
            ? "Coming Soon"
            : unavailable
              ? "Out of Stock"
              : "Add to cart"}
        </button>

        {message && (
          <p className="text-sm font-semibold text-[color:var(--brand-blue)]">
            {message}
          </p>
        )}

        {unavailable && (
          <p className="text-sm font-semibold text-red-600">
            {comingSoon
              ? "This textbook is not yet available for purchase."
              : "This item is currently out of stock."}
          </p>
        )}
      </div>

      {added && !unavailable && (
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