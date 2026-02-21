"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

export default function ProductCard({ product }: any) {
  const { addToCart } = useCart();
  const [message, setMessage] = useState<string | null>(null);

  const imageSrc =
    product?.imageSrc ||
    product?.image?.src ||
    "/products/placeholder.webp";

  const handleAddToCart = () => {
    const success = addToCart(
      {
        id: product.id,
        name: product.name,
        retailPrice: product.retailPrice,
        slug: product.slug,
        imageSrc: imageSrc,
        stockQty: product.stockQty,
      },
      1
    );

    if (!success) {
      setMessage("Maximum stock reached.");
      return;
    }

    setMessage("Added to cart.");

    setTimeout(() => {
      setMessage(null);
    }, 2000);
  };

  const outOfStock = product.stockQty <= 0;

  return (
    <div className="card-brand p-4">
      <div className="flex h-44 items-center justify-center bg-white">
        <Image
          src={imageSrc}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-auto object-contain"
        />
      </div>

      <div className="mt-4 font-semibold">
        {product.name}
      </div>

      <div className="mt-1 font-extrabold text-lg text-[color:var(--brand-blue)]">
        GH₵ {product.retailPrice}
      </div>

      <button
        type="button"
        disabled={outOfStock}
        onClick={handleAddToCart}
        className={`btn-primary mt-4 w-full px-4 py-3 ${
          outOfStock ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {outOfStock ? "Out of Stock" : "Add to cart"}
      </button>

      {message && (
        <p className="mt-2 text-xs font-semibold text-green-700">
          {message}
        </p>
      )}
    </div>
  );
}
