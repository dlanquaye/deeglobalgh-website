"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";

/* -------------------------------------------
   TYPES (Prisma-based Product shape)
------------------------------------------- */
type CategoryProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc: string;
  stockQty: number;
  categorySlug: string;
};

function prettifySlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CategoryClient({
  slug,
  products,
}: {
  slug: string;
  products: CategoryProduct[];
}) {
  const { addToCart } = useCart();

  const pretty = useMemo(() => prettifySlug(slug), [slug]);

  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () => products.filter((p) => p.categorySlug === slug),
    [products, slug]
  );

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
        Found <span className="font-semibold">{filtered.length}</span>{" "}
        product{filtered.length === 1 ? "" : "s"} in this category.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((p) => {
            const imageSrc =
              p.imageSrc || "/products/placeholder.webp";

            const pid = String(p.id);

            const outOfStock = p.stockQty <= 0;

            return (
              <div
                key={pid}
                className="rounded-2xl border bg-white p-4 hover:bg-gray-50"
              >
                {/* Product link */}
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50">
                    <Image
                      src={imageSrc}
                      alt={p.name}
                      width={500}
                      height={500}
                      className="h-48 w-auto object-contain"
                    />
                  </div>

                  <div className="mt-3 font-semibold text-[color:var(--text-main)]">
                    {p.name}
                  </div>
                </Link>

                <div className="mt-1 font-bold text-lg text-[color:var(--brand-blue)]">
                  GH₵ {p.retailPrice}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  Stock available: {p.stockQty}
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  disabled={outOfStock}
                  className={`mt-4 w-full rounded-xl px-4 py-3 font-extrabold ${
                    outOfStock
                      ? "cursor-not-allowed bg-gray-300 text-gray-600"
                      : "bg-blue-900 text-white hover:opacity-90"
                  }`}
                  onClick={() => {
                    if (outOfStock) return;

                    const success = addToCart(
                      {
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        retailPrice: p.retailPrice,
                        imageSrc: p.imageSrc ?? null,
                        stockQty: p.stockQty ?? 0,
                      },
                      1
                    );

                    if (success) {
                      setAddedMap((prev) => ({ ...prev, [pid]: true }));

                      window.setTimeout(() => {
                        setAddedMap((prev) => ({
                          ...prev,
                          [pid]: false,
                        }));
                      }, 2000);
                    }
                  }}
                >
                  {outOfStock
                    ? "Out of Stock"
                    : addedMap[pid]
                    ? "Added ✓"
                    : "Add to cart"}
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