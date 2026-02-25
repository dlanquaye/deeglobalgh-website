"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function ShopClient({ products }: any) {
  const { addToCart } = useCart();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p: any) => {
      const name = String(p?.name || "").toLowerCase();
      const cat = String(p?.categorySlug || "").toLowerCase();
      const levelsArray = Array.isArray(p?.levelSlugs)
        ? p.levelSlugs
        : [];

      const levels = levelsArray.join(" ").toLowerCase();

      const matchesSearch =
        !q || name.includes(q) || cat.includes(q) || levels.includes(q);

      const matchesCategory = !category || p?.categorySlug === category;
      const matchesLevel = !level || levelsArray.includes(level);

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [query, category, level, products]);

  return (
    <main className="py-6">
      <section className="card-brand p-6">
        <h1 className="text-2xl font-extrabold text-blue-900">
          Shop All Products
        </h1>

        <p className="mt-2 text-gray-600">
          Showing {filteredProducts.length} product
          {filteredProducts.length === 1 ? "" : "s"}.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p: any) => {
            const imageSrc =
  p?.imageSrc || "/products/placeholder.webp";

            const pid = String(p?.id);

            return (
              <Link
                key={pid}
                href={`/product/${p?.slug}`}
                className="card-brand p-4 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-52 items-center justify-center overflow-hidden rounded-2xl border bg-white">
                  <img
                    src={imageSrc}
                    alt={p?.name}
                    className="h-48 w-auto object-contain p-2"
                  />
                </div>

                <div className="mt-4 font-semibold">
                  {p?.name}
                </div>

                <div className="mt-1 font-extrabold text-lg text-blue-900">
                  GH₵ {Number(p?.retailPrice)}
                </div>

                <button
                  type="button"
                  className="btn-primary mt-4 w-full px-4 py-3"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    addToCart(
                      {
                        id: String(p?.id),
                        name: p?.name,
                        slug: p?.slug,
                        retailPrice: Number(p?.retailPrice ?? 0),
                        imageSrc: p?.imageSrc ?? null,
                        stockQty: Number(p?.stockQty ?? 0),
                      },
                      1
                    );
                    setAddedMap((prev) => ({
                      ...prev,
                      [pid]: true,
                    }));

                    window.setTimeout(() => {
                      setAddedMap((prev) => ({
                        ...prev,
                        [pid]: false,
                      }));
                    }, 2000);
                  }}
                >
                  {addedMap[pid] ? "Added ✓" : "Add to cart"}
                </button>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}