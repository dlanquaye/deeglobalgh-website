"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

export default function ShopClient({ products }: any) {
  const { addToCart } = useCart();

  const [query, setQuery] = useState("");
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [messageMap, setMessageMap] = useState<Record<string, string | null>>({});

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p: any) =>
      p.name.toLowerCase().includes(q)
    );
  }, [query, products]);

  return (
    <main className="py-6">
      <section className="card-brand p-6">
        <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
          Shop All Products
        </h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="input-brand mt-6 w-full px-4 py-3"
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p: any) => {
            const pid = p.id;
            const stockQty = p.stockQty ?? 0;
            const lowThreshold = p.lowStockThreshold ?? 3;

            const outOfStock = stockQty <= 0;
            const lowStock = stockQty > 0 && stockQty <= lowThreshold;

            const imageSrc =
              p.imageSrc || "/products/placeholder.webp";

            return (
              <Link
                key={pid}
                href={`/product/${p.slug}`}
                className="card-brand relative p-4 transition hover:-translate-y-1 hover:shadow-xl"
              >
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
                <div className="flex h-44 items-center justify-center overflow-hidden rounded-xl border bg-white">
                  <Image
                    src={imageSrc}
                    alt={p.imageAlt || p.name}
                    width={400}
                    height={400}
                    className="h-full w-auto object-contain p-2"
                  />
                </div>

                {/* NAME */}
                <div className="mt-4 font-semibold text-[color:var(--text-main)]">
                  {p.name}
                </div>

                {/* PRICE */}
                <div className="mt-1 font-extrabold text-lg text-[color:var(--brand-blue)]">
                  GH₵ {p.retailPrice}
                </div>

                {/* ADD BUTTON */}
                <button
                  type="button"
                  disabled={outOfStock}
                  className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold ${
                    outOfStock
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "btn-primary"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (outOfStock) {
                      setMessageMap((prev) => ({
                        ...prev,
                        [pid]: "This item is out of stock.",
                      }));
                      return;
                    }

                    const success = addToCart(
                      { ...p, price: p.retailPrice },
                      1
                    );

                    if (!success) {
                      setMessageMap((prev) => ({
                        ...prev,
                        [pid]: "Cannot add more than available stock.",
                      }));
                      return;
                    }

                    setAddedMap((prev) => ({
                      ...prev,
                      [pid]: true,
                    }));

                    setTimeout(() => {
                      setAddedMap((prev) => ({
                        ...prev,
                        [pid]: false,
                      }));
                    }, 1500);
                  }}
                >
                  {outOfStock
                    ? "Out of Stock"
                    : addedMap[pid]
                    ? "Added ✓"
                    : "Add to cart"}
                </button>

                {/* MESSAGE */}
                {messageMap[pid] && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {messageMap[pid]}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
