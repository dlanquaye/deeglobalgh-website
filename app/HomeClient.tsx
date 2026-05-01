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

  setFeatured(products.slice(0, 6));

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

          <h1 className="text-3xl font-bold leading-tight">
  Buy Textbooks & School Supplies in Kasoa — Fast Delivery Available
</h1>

<p className="mt-3 max-w-2xl text-white/90">
  Order all your school items in one place. From Pre-School to SHS, we deliver textbooks, stationery, and full school lists across Kasoa, Accra, and Ghana.
</p>

<p className="mt-2 text-sm text-white/80 font-medium">
  ✔ NaCCA Approved • ✔ Fast Delivery • ✔ WhatsApp Ordering Available
</p>

          <div className="mt-6 flex flex-wrap gap-3">

  {/* PRIMARY CTA */}
  <Link
    href="https://wa.me/233246011773"
    target="_blank"
    className="bg-yellow-400 text-blue-900 px-5 py-3 rounded-xl font-bold shadow-lg"
  >
    Order via WhatsApp
  </Link>

  {/* SECONDARY */}
  <Link
    href="/school-list-items-kasoa"
    className="bg-green-500 px-5 py-3 rounded-xl font-bold text-white"
  >
    View Full School List
  </Link>

  {/* SUPPORT */}
  <Link
    href="/shop"
    className="bg-white text-blue-900 px-5 py-3 rounded-xl font-semibold"
  >
    Shop All
  </Link>

</div>
        </div>
      </section>

      {/* ================= DELIVERY STRIP ================= */}
<section className="bg-green-600 text-white py-4">
  <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-3">

    <p className="font-semibold text-center md:text-left">
      🚚 Fast delivery available in Kasoa, Accra & nationwide — Order now via WhatsApp
    </p>

    <a
      href="https://wa.me/233246011773"
      target="_blank"
      className="bg-white text-green-700 px-4 py-2 rounded-xl font-bold"
    >
      Order Now
    </a>

  </div>
</section>

<div className="flex flex-wrap gap-3 justify-center">

  <Link href="/shop?level=pre-school" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    Pre-School
  </Link>

  <Link href="/shop?level=basic-1" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    Basic 1
  </Link>

  <Link href="/shop?level=basic-2" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    Basic 2
  </Link>

  <Link href="/shop?level=basic-3" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    Basic 3
  </Link>

  <Link href="/shop?level=basic-4" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    Basic 4
  </Link>

  <Link href="/shop?level=basic-5" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    Basic 5
  </Link>

  <Link href="/shop?level=basic-6" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    Basic 6
  </Link>

  <Link href="/shop?level=jhs" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    JHS
  </Link>

  <Link href="/shop?level=shs" className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold">
    SHS
  </Link>

</div>

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

{/* ================= SCHOOL LEVEL ================= */}
<section className="mx-auto max-w-6xl px-4 pb-12">
  <h2 className="text-xl font-bold mb-4">Shop by School Level</h2>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

    {[
      { name: "Pre-School", slug: "pre-school" },
      { name: "Basic 1", slug: "basic-1" },
      { name: "Basic 2", slug: "basic-2" },
      { name: "Basic 3", slug: "basic-3" },
      { name: "Basic 4", slug: "basic-4" },
      { name: "Basic 5", slug: "basic-5" },
      { name: "Basic 6", slug: "basic-6" },
      { name: "JHS", slug: "jhs" },
      { name: "SHS", slug: "shs" },
    ].map((level) => (
      <Link
        key={level.slug}
        href={`/shop?level=${level.slug}`}
        className="rounded-2xl border bg-white p-5 hover:bg-blue-50 hover:shadow-md transition text-center font-semibold"
      >
        {level.name}
      </Link>
    ))}

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
  <div
    key={p.id}
    className="min-w-[260px] bg-white border rounded-2xl p-4 shadow-sm flex flex-col"
  >
    <Link href={`/product/${p.slug}`}>
      <div className="relative h-48">
        <Image src={p.imageSrc} alt={p.name} fill className="object-contain" />
      </div>

      <div className="mt-2 text-sm font-semibold line-clamp-2 min-h-[40px]">
        {p.name}
      </div>

      <div className="mt-1 text-lg font-bold text-blue-900">
        GH₵ {p.retailPrice}
      </div>
    </Link>

    {/* BUTTONS */}
    <div className="mt-auto pt-3 flex items-center justify-between gap-2">

      <Link
        href={`/product/${p.slug}`}
        className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full"
      >
        View
      </Link>

      <button
        onClick={() =>
          window.open(
            `https://wa.me/233246011773?text=${encodeURIComponent(
              `Hello, I want to order:
Product: ${p.name}
Price: GH₵ ${p.retailPrice}
Quantity: 1`
            )}`,
            "_blank"
          )
        }
        className="text-xs font-semibold bg-green-600 text-white px-3 py-1 rounded-full"
      >
        WhatsApp
      </button>

    </div>
  </div>
))}
          </div>

          <button onClick={() => scroll("right")} className="border px-3 py-2">→</button>
        </div>
      </section>

    </main>
  );
}