"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";import Image from "next/image";
import { useCart } from "../context/CartContext";
import Link from "next/link";

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
const saveRecentlyViewed = () => {
  const existing = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");

  const updated = [
    product,
    ...existing.filter((p: any) => p.id !== product.id),
  ].slice(0, 4);

  localStorage.setItem("recentlyViewed", JSON.stringify(updated));
};
const formatProductName = (name: string) => {
  return name
    .replace("Wise Ant", "")
    .replace("Textbook For", "Textbook —")
    .trim();
    
};



return (
  <Link
  href={`/product/${product.slug}`}
  className="block"
  onClick={saveRecentlyViewed}
>
    <div className="relative card-brand overflow-hidden bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    </div>
    
    {/* Popular Badge */}
    {product.name?.toLowerCase().includes("textbook") && (
      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md shadow">
        Popular
      </div>
    )}

    {/* Low Stock Badge */}
    {"stock" in product && typeof product.stock === "number" && product.stock <= 5 && (
  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow">
    Low Stock
  </div>
)}

      {/* STOCK BADGE */}
      {outOfStock && (
        <div className="absolute left-3 top-3 z-10">
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            Out of Stock
          </span>
        </div>
      )}

      {/* IMAGE */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gray-50 rounded-lg p-3 group">
  
  <Image
    src={imageSrc}
    alt={product.name}
    width={400}
    height={400}
    className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
  />

  {/* HOVER OVERLAY */}
  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
    <span className="text-white text-sm font-semibold">
      View Details
    </span>
  </div>

</div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="text-sm font-semibold text-[color:var(--text-main)]">
          {formatProductName(product.name)}
        </div>

{stockQty > 0 && stockQty <= 5 && (
  <p className="text-xs text-red-600 font-medium mt-1">
    Only few left
  </p>
)}

        <div className="mt-2 flex flex-col gap-2">

  {/* WHATSAPP FIRST */}
  <button
  onClick={(e) => {
    e.stopPropagation();
    window.open(
      `https://wa.me/233246011773?text=${encodeURIComponent(
        `Hello, I want to order:
Product: ${product.name}
Price: GH₵ ${product.retailPrice}
Quantity: 1

I may also add more items.`
      )}`,
      "_blank"
    );
  }}
  className="w-full text-center bg-green-600 text-white text-sm py-2 rounded-xl hover:bg-green-700 transition font-bold"
>
  Order via WhatsApp
</button>

  {/* ADD TO CART SECOND */}
  <button
    type="button"
    disabled={outOfStock}
    onClick={handleAddToCart}
    className={`w-full rounded-xl py-2 text-sm font-bold ${
      outOfStock
        ? "cursor-not-allowed bg-gray-200 text-gray-500"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
  </Link>
  );
}