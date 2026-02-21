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

export default function HomeClient({
  products = [],
}: {
  products?: HomeProduct[];
}) {
  const router = useRouter();
  const { addToCart, totalItems } = useCart();

  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState<HomeProduct[]>([]);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [pauseAuto, setPauseAuto] = useState(false);

  /* ---------------- Featured Shuffle ---------------- */
  useEffect(() => {
    if (!Array.isArray(products)) return;
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    setFeatured(shuffled.slice(0, 6));
  }, [products]);

  const featuredRef = useRef<HTMLDivElement | null>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = featuredRef.current;
    if (!el) return;
    const amount = dir === "left" ? -320 : 320;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  /* ---------------- Auto Scroll ---------------- */
  useEffect(() => {
    if (featured.length < 6 || pauseAuto) return;
    const id = setInterval(() => scroll("right"), 5000);
    return () => clearInterval(id);
  }, [featured, pauseAuto, scroll]);

  /* ---------------- Categories ---------------- */
  const categories = [
    "Textbooks",
    "Exam Materials",
    "School Essentials",
    "Dormitory Essentials",
    "Uniforms & Clothing Essentials",
    "Drawing & Technical",
    "Bags & Lunch Packs",
    "Calculators",
  ];

  const levels = [
    "Pre-School",
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "JHS 1",
    "JHS 2",
    "JHS 3",
    "SHS 1",
    "SHS 2",
    "SHS 3",
  ];

  return (
    <main className="min-h-screen bg-white">

      {/* ---------------- HERO ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border bg-gray-50 p-6">
          <h1 className="text-2xl font-bold">
            Shop Textbooks, Stationery & School Essentials in Ghana
          </h1>
          <p className="mt-2 text-gray-700">
            Fast delivery. Secure checkout. Easy shopping for parents and students.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary px-5 py-3">
              Shop All Products
            </Link>
            <a
              href="https://wa.me/233246011773"
              target="_blank"
              className="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-blue-950"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/shop?category=${slugify(c)}`}
              className="rounded-2xl border p-5 hover:bg-gray-50"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold">Featured Products</h2>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => scroll("left")} className="border px-3 py-2">
            ←
          </button>

          <div
            ref={featuredRef}
            onMouseEnter={() => setPauseAuto(true)}
            onMouseLeave={() => setPauseAuto(false)}
            className="flex flex-1 gap-4 overflow-x-auto scroll-smooth"
          >
            {featured.map((p) => {
              const out = p.stockQty <= 0;

              return (
                <div
                  key={p.id}
                  className="min-w-[280px] rounded-2xl border bg-white p-4"
                >
                  <Link href={`/product/${p.slug}`}>
                    <div className="relative h-52 bg-gray-50">
                      <Image
                        src={p.imageSrc || "/products/placeholder.webp"}
                        alt={p.name}
                        fill
                        className="object-contain p-3"
                      />
                    </div>

                    <div className="mt-3 font-semibold">{p.name}</div>
                    <div className="mt-1 font-bold text-blue-900">
                      GH₵ {p.retailPrice}
                    </div>
                  </Link>

                  <button
                    disabled={out}
                    onClick={() => {
                      if (out) return;
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
                          [p.id]: true,
                        }));

                        setTimeout(() => {
                          setAddedMap((prev) => ({
                            ...prev,
                            [p.id]: false,
                          }));
                        }, 2000);
                      }
                    }}
                    className={`mt-3 w-full rounded-xl px-4 py-3 font-bold ${
                      out
                        ? "bg-gray-300 text-gray-600"
                        : "bg-yellow-500 text-blue-950"
                    }`}
                  >
                    {out
                      ? "Out of Stock"
                      : addedMap[p.id]
                      ? "Added ✓"
                      : "Add to cart"}
                  </button>
                </div>
              );
            })}
          </div>

          <button onClick={() => scroll("right")} className="border px-3 py-2">
            →
          </button>
        </div>
      </section>

      {/* ---------------- LEVELS ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold">Shop by School Level</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {levels.map((level) => (
            <Link
              key={level}
              href={`/shop?level=${slugify(level)}`}
              className="rounded-full border px-4 py-2"
            >
              {level}
            </Link>
          ))}
        </div>
      </section>
{/* ================= TRUST SECTION ================= */}
<section className="border-t bg-gray-50">
  <div className="mx-auto max-w-6xl px-4 py-10">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border bg-white p-5">
        <div className="font-semibold">Fast Delivery</div>
        <div className="mt-1 text-sm text-gray-600">
          Delivery across Kasoa, Accra and beyond.
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <div className="font-semibold">Secure Checkout</div>
        <div className="mt-1 text-sm text-gray-600">
          Pay with MoMo or card securely.
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <div className="font-semibold">WhatsApp Support</div>
        <div className="mt-1 text-sm text-gray-600">
          Ask questions before you buy.
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <div className="font-semibold">Trusted Shop</div>
        <div className="mt-1 text-sm text-gray-600">
          Genuine items and reliable service.
        </div>
      </div>
    </div>
  </div>
</section>

{/* ================= FOOTER ================= */}
<footer className="border-t bg-white">
  <div className="mx-auto max-w-6xl px-4 py-10">
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

      <div>
        <div className="font-bold text-blue-900 text-lg">
          DeeGlobalGH
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Smart Deals, Everyday Needs.
        </p>
      </div>

      <div>
        <div className="font-semibold text-blue-900">
          Delivery
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Order online and we deliver across Kasoa, Accra, and beyond.
        </p>
      </div>

      <div>
        <div className="font-semibold text-blue-900">
          Contact
        </div>
        <div className="mt-2 text-sm text-gray-600">
          WhatsApp: <strong>0246 011 773</strong>
        </div>
        <div className="text-sm text-gray-600">
          Call: <strong>054 113 1111</strong>
        </div>
        <div className="text-sm text-gray-600">
          Call: <strong>030 398 2358</strong>
        </div>
      </div>

      <div>
        <div className="font-semibold text-blue-900">
          Quick Links
        </div>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <Link href="/shop" className="block hover:underline">
            Shop All Products
          </Link>
          <Link href="/textbooks" className="block hover:underline">
            Textbooks
          </Link>
          <a
            href="https://wa.me/233246011773"
            target="_blank"
            className="block hover:underline"
          >
            WhatsApp Support
          </a>
        </div>
      </div>

    </div>

    <div className="mt-10 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} DeeGlobalGH. All rights reserved.
    </div>
  </div>
</footer>
    </main>
  );
}