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
  sku?: string | null;
  categorySlug: string;
};

function prettifySlug(slug?: string) {
  return slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">{pretty}</h1>

      {slug === "story-books" && (
        <p className="mt-3 max-w-2xl text-gray-600">
          Buy story books for kids and students in Ghana. Explore African story books,
          literature books, and reading books for all levels. DeeGlobalGH stocks quality
          story books with fast delivery across Kasoa and Ghana.
        </p>
      )}

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
        Showing <span className="font-semibold">{products.length}</span>{" "}
        product{products.length === 1 ? "" : "s"} on this page.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.length > 0 ? (
          products.map((p) => {
            const imageSrc =
              p.imageSrc || "/products/placeholder.webp";

            const pid = String(p.id);

            const comingSoon = p.sku === "DG-SHS-FAN-WA-NEW03";
            const outOfStock = p.stockQty <= 0;
            const unavailable = comingSoon || outOfStock;

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

                <div className="mt-1 text-lg font-bold text-[color:var(--brand-blue)]">
                  GH₵ {p.retailPrice}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {comingSoon
                    ? "COMING SOON"
                    : `Stock available: ${p.stockQty}`}
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  disabled={unavailable}
                  className={`mt-4 w-full rounded-xl px-4 py-3 font-extrabold ${
                    unavailable
                      ? "cursor-not-allowed bg-gray-300 text-gray-600"
                      : "bg-blue-900 text-white hover:opacity-90"
                  }`}
                  onClick={() => {
                    if (unavailable) return;

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
                  {comingSoon
                    ? "Coming Soon"
                    : unavailable
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