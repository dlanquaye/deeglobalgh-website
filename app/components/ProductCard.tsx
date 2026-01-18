"use client";

import Image from "next/image";
import type { Product } from "@/app/lib/products";
import { useCart } from "@/app/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const imageSrc = product?.image?.src || "/products/placeholder.webp";
  const imageAlt = product?.image?.alt || product?.name || "DeeglobalGh product";
  const imageTitle = product?.image?.title || product?.name || "Product image";

  return (
    <div className="card-brand overflow-hidden bg-white">
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

      <div className="p-4">
        <div className="text-sm font-semibold text-[color:var(--text-main)]">
          {product.name}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-base font-bold text-[color:var(--brand-blue)] whitespace-nowrap">
            GH₵ {product.price}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            className="btn-primary !px-4 !py-2 text-sm whitespace-nowrap"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
