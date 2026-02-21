"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

/* -------------------------------------------
   TYPES (Prisma-aligned shape)
------------------------------------------- */
type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc: string;
  stockQty: number;
};

type Props = {
  product: ProductCardProduct;
};

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();

  const [stockQty, setStockQty] = useState<number>(product.stockQty);
  const [message, setMessage] = useState<string | null>(null);

  /* -------------------------------------------
     Sync stock if product changes
  ------------------------------------------- */
  useEffect(() => {
    setStockQty(product.stockQty);
  }, [product.stockQty]);

  /* -------------------------------------------
     Auto-clear message
  ------------------------------------------- */
  useLayoutEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  /* -------------------------------------------
     STOCK STATES
  ------------------------------------------- */
  const outOfStock = stockQty <= 0;

  /* -------------------------------------------
     IMAGE
  ------------------------------------------- */
  const imageSrc =
    product.imageSrc || "/products/placeholder.webp";

  /* -------------------------------------------
     ADD TO CART
  ------------------------------------------- */
  const handleAddToCart = () => {
    if (outOfStock) {
      setMessage("This item is currently out of stock.");
      return;
    }

    requestAnimationFrame(() => {
      const success = addToCart(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          retailPrice: product.retailPrice,
          imageSrc: product.imageSrc,
          stockQty: product.stockQty,
        },
        1
      );

      if (!success) {
        setMessage("Unable to add item to cart. Please refresh.");
      } else {
        setMessage("Added to cart.");
      }
    });
  };

  /* -------------------------------------------
     RENDER
  ------------------------------------------- */
  return (
    <div className="card-brand relative overflow-hidden bg-white">
      {/* Stock badge */}
      {outOfStock && (
        <div className="absolute left-3 top-3 z-10">
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            Out of Stock
          </span>
        </div>
      )}

      {/* Image */}
      <div className="flex h-44 items-center justify-center overflow-hidden bg-[color:var(--bg-soft)]">
        <Image
          src={imageSrc}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm font-semibold text-[color:var(--text-main)]">
          {product.name}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="whitespace-nowrap text-base font-bold text-[color:var(--brand-blue)]">
            GH₵ {product.retailPrice}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className={`rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap ${
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