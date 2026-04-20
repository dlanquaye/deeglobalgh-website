"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function ProductCard({ product }: any) {
  const { addToCart } = useCart();

  return (
    <div className="border p-4 rounded-xl hover:bg-gray-50">
      
      <Link href={`/product/${product.slug}`}>
        <div className="font-semibold cursor-pointer">
          {product.name}
        </div>
      </Link>

      <div className="text-blue-900 font-bold mt-2">
        GH₵ {product.retailPrice}
      </div>

      <button
        onClick={() => {
            addToCart(
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

        }}
        className="mt-3 w-full bg-blue-900 text-white py-2 rounded-lg"
      >
        Add to Cart
      </button>
    </div>
  );
}