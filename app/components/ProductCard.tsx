"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";import Image from "next/image";
import { useCart } from "../context/CartContext";

/* -------------------------------------------
   TYPES
------------------------------------------- */
type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc?: string | null;
  stockQty?: number | null;
};

type Props = {
  product: ProductCardProduct;
};

export default function ProductCard({ product }: Props) {
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);
  const { addToCart } = useCart();

  /* -------------------------------------------
     SAFE NORMALIZATION (VERY IMPORTANT)
  ------------------------------------------- */
  const stockQty = typeof product.stockQty === "number" ? product.stockQty : 0;

  const imageSrc =
    typeof product.imageSrc === "string" && product.imageSrc.length > 0
      ? product.imageSrc
      : "/placeholder.png";

  const outOfStock = stockQty <= 0;

  const [message, setMessage] = useState<string | null>(null);

  /* -------------------------------------------
     AUTO CLEAR MESSAGE
  ------------------------------------------- */
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  /* -------------------------------------------
     ADD TO CART
  ------------------------------------------- */
  const handleAddToCart = () => {
    if (outOfStock) {
      setMessage("This item is currently out of stock.");
      return;
    }

    const success = addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        retailPrice: product.retailPrice,
        imageSrc: imageSrc,
        stockQty: stockQty,
      },
      1
    );

    setMessage(
      success
        ? "Added to cart."
        : "Unable to add item to cart. Please refresh."
    );
  };

  /* -------------------------------------------
     UI
  ------------------------------------------- */
  if (!mounted) return null;
  return (
    <div className="card-brand relative overflow-hidden bg-white">
      {/* STOCK BADGE */}
      {outOfStock && (
        <div className="absolute left-3 top-3 z-10">
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            Out of Stock
          </span>
        </div>
      )}

      {/* IMAGE */}
      <div className="flex h-44 items-center justify-center overflow-hidden bg-gray-100">
        <Image
          src={imageSrc}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-auto object-contain"
          priority={false}
        />
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="text-sm font-semibold text-[color:var(--text-main)]">
          {product.name}
        </div>

        <div className="mt-2 flex flex-col gap-2">
  <div className="text-base font-bold text-[color:var(--brand-blue)]">
    GH₵ {product.retailPrice}
  </div>

  <button
    type="button"
    disabled={outOfStock}
    onClick={handleAddToCart}
    className={`w-full rounded-xl py-2 text-sm font-bold ${
      outOfStock
        ? "cursor-not-allowed bg-gray-200 text-gray-500"
        : "btn-primary"
    }`}
  >
    {outOfStock ? "Out of Stock" : "Add to cart"}
  </button>
</div>

        {message && (
          <p className="mt-2 text-xs font-semibold text-green-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}