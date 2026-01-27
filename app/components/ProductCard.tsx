"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import type { Product } from "@/app/lib/products";
import { useCart } from "@/app/context/CartContext";
import { initInventory } from "@/app/lib/inventory";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();

  const [stockQty, setStockQty] = useState<number>(0);
  const [lowThreshold, setLowThreshold] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);

  /* -------------------------------------------
     INVENTORY INITIALISATION
     ------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadInventory = async () => {
      await initInventory();
      if (!mounted) return;

      setStockQty(product.stockQty ?? 0);
      setLowThreshold(product.lowStockThreshold ?? 0);
    };

    loadInventory();

    return () => {
      mounted = false;
    };
  }, [product.stockQty, product.lowStockThreshold]);

  /* -------------------------------------------
     MESSAGE LIFECYCLE (PAINT-SAFE)
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
  const lowStock = stockQty > 0 && stockQty <= lowThreshold;

  /* -------------------------------------------
     IMAGE FALLBACKS
     ------------------------------------------- */
  const imageSrc =
    product.image?.src || "/products/placeholder.webp";

  const imageAlt =
    product.image?.alt ||
    product.name ||
    "DeeglobalGh product";

  const imageTitle =
    product.image?.title ||
    product.name ||
    "Product image";

  /* -------------------------------------------
     ADD TO CART HANDLER (RENDER-SAFE)
     ------------------------------------------- */
  const handleAddToCart = () => {
    if (outOfStock) {
      setMessage("This item is currently out of stock.");
      return;
    }

    // Allow message to paint before cart context update
    setMessage("Added to cart.");

    requestAnimationFrame(() => {
      const success = addToCart(product, 1);

      if (!success) {
        setMessage("Unable to add item to cart. Please refresh.");
      }
    });
  };

  /* -------------------------------------------
     RENDER
     ------------------------------------------- */
  return (
    <div className="card-brand relative overflow-hidden bg-white">
      {/* STOCK BADGE */}
      <div className="absolute left-3 top-3 z-10">
        {outOfStock && (
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            Out of Stock
          </span>
        )}

        {!outOfStock && lowStock && (
          <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black">
            Low Stock
          </span>
        )}
      </div>

      {/* IMAGE */}
      <div className="bg-white">
        <div className="flex h-44 items-center justify-center bg-[color:var(--bg-soft)] overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            title={imageTitle}
            width={400}
            height={400}
            className="h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="text-sm font-semibold text-[color:var(--text-main)]">
          {product.name}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="whitespace-nowrap text-base font-bold text-[color:var(--brand-blue)]">
            GH₵ {product.price}
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

        {/* USER FEEDBACK */}
        {message && (
          <p className="mt-2 text-xs font-semibold text-green-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
