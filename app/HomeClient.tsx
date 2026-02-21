"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

type HomeProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc: string;
  stockQty: number;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function Home({ products }: { products: HomeProduct[] }) {
  const router = useRouter();
  const { addToCart, totalItems } = useCart();

  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState<HomeProduct[]>([]);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [pauseFeaturedAutoScroll, setPauseFeaturedAutoScroll] =
    useState(false);

  useEffect(() => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    setFeatured(shuffled.slice(0, 6));
  }, [products]);

  const featuredRef = useRef<HTMLDivElement | null>(null);

  const scrollFeatured = useCallback((dir: "left" | "right") => {
    const el = featuredRef.current;
    if (!el) return;

    const amount = dir === "left" ? -320 : 320;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (featured.length < 6) return;
    if (pauseFeaturedAutoScroll) return;

    const id = setInterval(() => {
      scrollFeatured("right");
    }, 5000);

    return () => clearInterval(id);
  }, [featured, pauseFeaturedAutoScroll, scrollFeatured]);

  return (
    <main className="min-h-screen bg-white">
      {/* Featured Products Section Only (Shortened for clarity) */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Featured Products</h2>
          <Link
            href="/shop"
            className="text-sm font-bold text-blue-900 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => scrollFeatured("left")}
            className="rounded-full border bg-white px-3 py-2 font-bold"
          >
            ←
          </button>

          <div
            ref={featuredRef}
            onMouseEnter={() => setPauseFeaturedAutoScroll(true)}
            onMouseLeave={() => setPauseFeaturedAutoScroll(false)}
            className="flex flex-1 gap-4 overflow-x-auto pb-3 scroll-smooth"
          >
            {featured.map((p) => {
              const pid = p.id;
              const outOfStock = p.stockQty <= 0;

              return (
                <div
                  key={pid}
                  className="min-w-[280px] max-w-[280px] rounded-2xl border bg-white p-4"
                >
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="relative h-52 w-full overflow-hidden rounded-xl bg-gray-50">
                      <Image
                        src={
                          p.imageSrc || "/products/placeholder.webp"
                        }
                        alt={p.name}
                        fill
                        className="object-contain p-3"
                      />
                    </div>

                    <div className="mt-3 font-semibold">
                      {p.name}
                    </div>

                    <div className="mt-1 text-lg font-extrabold text-blue-900">
                      GH₵ {p.retailPrice}
                    </div>
                  </Link>

                  <button
                    type="button"
                    disabled={outOfStock}
                    onClick={() => {
                      if (outOfStock) return;

                      const success = addToCart(
                        {
                          id: p.id,
                          name: p.name,
                          slug: p.slug,
                          retailPrice: p.retailPrice,
                          imageSrc: p.imageSrc,
                          stockQty: p.stockQty,
                        },
                        1
                      );

                      if (success) {
                        setAddedMap((prev) => ({
                          ...prev,
                          [pid]: true,
                        }));

                        setTimeout(() => {
                          setAddedMap((prev) => ({
                            ...prev,
                            [pid]: false,
                          }));
                        }, 2000);
                      }
                    }}
                    className={`mt-3 w-full rounded-xl px-4 py-3 font-extrabold ${
                      outOfStock
                        ? "bg-gray-300 text-gray-600"
                        : "bg-yellow-500 text-blue-950 hover:opacity-90"
                    }`}
                  >
                    {outOfStock
                      ? "Out of Stock"
                      : addedMap[pid]
                      ? "Added ✓"
                      : "Add to cart"}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scrollFeatured("right")}
            className="rounded-full border bg-white px-3 py-2 font-bold"
          >
            →
          </button>
        </div>
      </section>
    </main>
  );
}