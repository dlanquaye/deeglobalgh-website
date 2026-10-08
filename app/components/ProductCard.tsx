"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "../context/CartContext";
import { trackWhatsAppClick } from "@/app/lib/analytics";

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

function ProductCardContent({ product }: Props) {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { addToCart } = useCart();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  /* -------------------------------------------
     SAFE NORMALIZATION
  ------------------------------------------- */
  const stockQty =
    typeof product.stockQty === "number"
      ? product.stockQty
      : 0;

  const imageSrc =
    typeof product.imageSrc === "string" &&
    product.imageSrc.length > 0
      ? product.imageSrc
      : "/placeholder.png";

  const outOfStock = stockQty <= 0;

  /* -------------------------------------------
     RETURN PATH
  ------------------------------------------- */
  const queryString = searchParams.toString();

  const returnTo = queryString
    ? `${pathname}?${queryString}`
    : pathname;

  const productHref = `/product/${product.slug}?${new URLSearchParams({
    returnTo,
  }).toString()}`;

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
        imageSrc,
        stockQty,
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
     RECENTLY VIEWED
  ------------------------------------------- */
  const saveRecentlyViewed = () => {
    const existing = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]"
    );

    const updated = [
      product,
      ...existing.filter(
        (item: any) => item.id !== product.id
      ),
    ].slice(0, 4);

    localStorage.setItem(
      "recentlyViewed",
      JSON.stringify(updated)
    );
  };

  const formatProductName = (name: string) => {
    return name
      .replace("Wise Ant", "")
      .replace("Textbook For", "Textbook â€”")
      .trim();
  };

  if (!mounted) {
    return null;
  }

  return (
    <Link
      href={productHref}
      className="block"
      onClick={saveRecentlyViewed}
    >
      <div className="relative card-brand overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      </div>

      {/* Popular Badge */}
      {product.name?.toLowerCase().includes("textbook") && (
        <div className="absolute left-2 top-2 rounded-md bg-green-600 px-2 py-1 text-xs text-white shadow">
          Popular
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
      <div className="group relative flex h-44 items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-3">
        <Image
          src={imageSrc}
          alt={product.name}
          width={400}
          height={400}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <span className="text-sm font-semibold text-white">
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
          <p className="mt-1 text-xs font-medium text-red-600">
            Only few left
          </p>
        )}

        <div className="mt-2 flex flex-col gap-2">
          {/* WHATSAPP */}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              trackWhatsAppClick(
                "product_card",
                "whatsapp",
                product.name
              );

              window.open(
                `https://wa.me/233270030000?text=${encodeURIComponent(
                  `Hello, I want to order:
Product: ${product.name}
Price: GHâ‚µ ${product.retailPrice}
Quantity: 1

I may also add more items.`
                )}`,
                "_blank"
              );
            }}
            className="w-full rounded-xl bg-green-600 py-2 text-center text-sm font-bold text-white transition hover:bg-green-700"
          >
            Order via WhatsApp
          </button>

          {/* ADD TO CART */}
          <button
            type="button"
            disabled={outOfStock}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleAddToCart();
            }}
            className={`w-full rounded-xl py-2 text-sm font-bold ${
              outOfStock
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {outOfStock
              ? "Out of Stock"
              : "Add to cart"}
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
export default function ProductCard(props: Props) {
  return (
    <Suspense fallback={null}>
      <ProductCardContent {...props} />
    </Suspense>
  );
}
