"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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

export default function HomeClient({ products = [] }: { products?: HomeProduct[] }) {
  const { addToCart, totalItems } = useCart();

  const [featured, setFeatured] = useState<HomeProduct[]>([]);
  const [pauseAuto, setPauseAuto] = useState(false);

  useEffect(() => {
  if (!products || products.length === 0) return;

  const shuffled = [...products]
    .map((p) => ({ p, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ p }) => p);

  setFeatured(shuffled.slice(0, 6));

}, [products]);

  const featuredRef = useRef<HTMLDivElement | null>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = featuredRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (featured.length < 6 || pauseAuto) return;
    const id = setInterval(() => scroll("right"), 5000);
    return () => clearInterval(id);
  }, [featured, pauseAuto, scroll]);

  // ✅ KEEP EXACT CATEGORY STRUCTURE (NO BREAK)
  const categories = [
    "Textbooks",
    "Story Books",
    "Exam Materials",
    "School Essentials",
    "Boarding Essentials",
    "Uniforms & Clothing Essentials",
    "Practical & Technical Essentials",
    "School Bags & Accessories",
    "School Electronics",
  ];

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= SEARCH ================= */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <form method="GET" action="/shop" className="flex gap-2">
            <input
              type="text"
              name="search"
              placeholder="Search textbooks, stationery, school items..."
              className="flex-1 border rounded-xl px-4 py-3"
            />
            <button className="bg-blue-900 text-white px-4 py-3 rounded-xl font-bold">
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/kasoa" className="rounded-xl border px-4 py-2">Kasoa</Link>
            <Link href="/textbooks-in-kasoa" className="rounded-xl border px-4 py-2">Textbooks in Kasoa</Link>
            <Link href="/stationery-in-kasoa" className="rounded-xl border px-4 py-2">Stationery in Kasoa</Link>
            <Link href="/cart" className="rounded-xl border px-4 py-2">
              Cart ({totalItems})
            </Link>
          </div>
        </div>
      </section>

      {/* ================= HERO (UPGRADED ONLY UI) ================= */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 text-white p-8 shadow-xl">

          <h1 className="text-3xl font-bold">
            Textbooks, Stationery & School Essentials in Kasoa
          </h1>

          <p className="mt-3 max-w-2xl text-white/90">
            NaCCA approved and new curriculum textbooks, learning aids, boarding essentials, and complete school supplies for Pre-School to SHS students, teachers, and parents across Ghana.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="bg-white text-blue-900 px-5 py-3 rounded-xl font-bold">
              Shop All
            </Link>

            <Link href="/kasoa" className="bg-white/20 px-5 py-3 rounded-xl font-bold">
              Shop in Kasoa
            </Link>

            <Link href="/school-list-items-kasoa" className="bg-green-500 px-5 py-3 rounded-xl font-bold">
              View Full School List
            </Link>

<Link
  href="https://wa.me/233246011773"
  target="_blank"
  className="bg-yellow-400 text-blue-900 px-5 py-3 rounded-xl font-bold"
>
  Order via WhatsApp
</Link>
            
          </div>
        </div>
      </section>

      {/* ================= TRUST ================= */}
      <section className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-6">
        <div className="rounded-xl border p-5 bg-white shadow-sm">
          <h3 className="font-semibold">NaCCA Approved</h3>
          <p className="text-gray-600 mt-2">
            All textbooks follow Ghana’s new curriculum standards.
          </p>
        </div>

        <div className="rounded-xl border p-5 bg-white shadow-sm">
          <h3 className="font-semibold">Complete School Supplies</h3>
          <p className="text-gray-600 mt-2">
            From textbooks to boarding essentials, everything in one place.
          </p>
        </div>

        <div className="rounded-xl border p-5 bg-white shadow-sm">
          <h3 className="font-semibold">Fast Delivery</h3>
          <p className="text-gray-600 mt-2">
            Reliable delivery across Kasoa, Accra, and Ghana.
          </p>
        </div>
      </section>

      {/* ================= CATEGORY (UNCHANGED LOGIC) ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const slug = slugify(c);

            return (
              <Link
                key={c}
                href={`/category/${slug}`}
                className="rounded-2xl border bg-white p-5 hover:bg-blue-50 hover:shadow-md transition"
              >
                {c}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= FEATURED (UNCHANGED CORE) ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Featured Products</h2>
          <Link href="/shop" className="text-blue-900 font-semibold">
            View all →
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => scroll("left")} className="border px-3 py-2">←</button>

          <div
  ref={featuredRef}
  onMouseEnter={() => setPauseAuto(true)}
  onMouseLeave={() => setPauseAuto(false)}
  className="flex gap-4 overflow-x-auto scroll-smooth"
>
            {featured.map((p) => (
              <div key={p.id} className="min-w-[260px] bg-white border rounded-xl p-4 shadow-sm">
                <Link href={`/product/${p.slug}`}>
                  <div className="relative h-48">
                    <Image src={p.imageSrc} alt={p.name} fill className="object-contain" />
                  </div>
                  <div className="mt-2 font-semibold">{p.name}</div>
                  <div className="text-blue-900 font-bold">GH₵ {p.retailPrice}</div>
                </Link>
              </div>
            ))}
          </div>

          <button onClick={() => scroll("right")} className="border px-3 py-2">→</button>
        </div>
      </section>

    </main>
  );
}