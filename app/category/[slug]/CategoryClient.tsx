"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import type { Product } from "@/app/lib/products";

function prettifySlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CategoryClient({ slug, products }: { slug: string; products: Product[] }) {
  const { addToCart } = useCart();

  const pretty = useMemo(() => prettifySlug(slug), [slug]);

  // ✅ Button feedback map
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => products.filter((p) => p.categorySlug === slug), [products, slug]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">{pretty}</h1>

      <p className="mt-2 text-gray-700">
        Showing products under <span className="font-semibold">{pretty}</span>.
      </p>

      <div className="mt-4">
        <Link
          href={`/shop?category=${slug}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 text-sm font-extrabold text-white hover:opacity-90"
        >
          View all in Shop
        </Link>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Found <span className="font-semibold">{filtered.length}</span> product
        {filtered.length === 1 ? "" : "s"} in this category.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((p) => {
            const imageSrc = p?.image?.src || "/products/placeholder.webp";
            const imageAlt = p?.image?.alt || p?.name || "DeeglobalGh product";
            const imageTitle = p?.image?.title || p?.name || "Product image";

            const pid = String(p?.id || p?.slug);

            return (
              <div key={pid} className="rounded-2xl border bg-white p-4 hover:bg-gray-50">
                {/* ✅ Product link only on image + name */}
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50">
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      title={imageTitle}
                      width={500}
                      height={500}
                      className="h-48 w-auto object-contain"
                    />
                  </div>

                  <div className="mt-3 font-semibold text-[color:var(--text-main)]">{p.name}</div>
                </Link>

                <div className="mt-1 font-bold text-lg text-[color:var(--brand-blue)]">
                  GH₵ {p.price}
                </div>

                {/* ✅ REAL Add to cart */}
                <button
                  type="button"
                  className="btn-primary mt-4 w-full px-4 py-3"
                  onClick={() => {
                    addToCart(p, 1);

                    setAddedMap((prev) => ({ ...prev, [pid]: true }));

                    window.setTimeout(() => {
                      setAddedMap((prev) => ({ ...prev, [pid]: false }));
                    }, 2000);
                  }}
                >
                  {addedMap[pid] ? "Added ✓" : "Add to cart"}
                </button>

                <Link
                  href={`/product/${p.slug}`}
                  className="btn-outline mt-3 inline-flex w-full items-center justify-center px-4 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
                >
                  View Product
                </Link>
              </div>
            );
          })
        ) : (
          <div className="mt-6 rounded-2xl border bg-white p-6 text-gray-700">
            No products found in this category yet.
          </div>
        )}
      </div>
    </main>
  );
}
