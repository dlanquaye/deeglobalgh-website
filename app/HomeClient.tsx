"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (!Array.isArray(products)) return;
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    setFeatured(shuffled.slice(0, 4));
  }, [products]);

  const featuredRef = useRef<HTMLDivElement | null>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = featuredRef.current;
    if (!el) return;
    const amount = dir === "left" ? -320 : 320;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (featured.length < 6 || pauseAuto) return;
    const id = setInterval(() => scroll("right"), 8000);
    return () => clearInterval(id);
  }, [featured, pauseAuto, scroll]);

  // ✅ UPDATED CATEGORY LIST (STORY BOOKS ADDED)
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

      {/* ================= SEARCH + SEO LINKS ================= */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <form method="GET" action="/shop" className="flex gap-2">
  <input
    type="text"
    name="search"
    placeholder="Search textbooks..."
    className="flex-1 border rounded-xl px-4 py-3"
  />
  <button
    type="submit"
    className="bg-blue-900 text-white px-4 py-3 rounded-xl font-bold"
  >
    Search
  </button>
</form>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/kasoa" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
              Kasoa
            </Link>
            <Link href="/textbooks-in-kasoa" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
              Textbooks in Kasoa
            </Link>
            <Link href="/stationery-in-kasoa" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
              Stationery in Kasoa
            </Link>
            <Link href="/cart" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
              Cart ({totalItems})
            </Link>
          </div>
        </div>
      </section>

      

      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border bg-gray-50 p-6">
          <h1 className="text-2xl font-bold">
            Shop Textbooks, Stationery & School Essentials in Ghana
          </h1>
          <p className="mt-2 text-gray-700">
            Fast delivery. Secure checkout. Easy shopping for parents and students.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
  <Link href="/shop" className="rounded-xl bg-blue-900 px-5 py-3 font-bold text-white">
    Shop All
  </Link>

  <Link href="/kasoa" className="rounded-xl border px-5 py-3 font-bold">
    Shop in Kasoa
  </Link>

  {/* ✅ NEW BUTTON (THIS IS ALL WE ADD) */}
  <Link
    href="/school-list-items-kasoa"
    className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
  >
    View Full School List
  </Link>

  <button
    onClick={() => {
      fetch("/api/checkout", {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.link) {
            window.location.href = data.link;
          }
        })
        .catch((err) => {
          console.error("Checkout error:", err);
        });
    }}
    className="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-blue-950"
  >
    Order via WhatsApp
  </button>
</div>
</div>
      </section>

      {/* ================= SHOP BY CATEGORY ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
  let slug = slugify(c);

  // 🔥 FORCE CORRECT SLUGS (VERY IMPORTANT)
  if (c === "SHS Combined Textbooks") {
    slug = "shs-combined-edition-textbooks";
  }
  if (c === "JHS Combined Textbooks") {
    slug = "jhs-combined-edition-textbooks";
  }

  return (
    <Link
      key={c}
      href={`/category/${slug}`}
      className="rounded-2xl border p-5 hover:bg-gray-50"
    >
      {c}
    </Link>
  );
})}
        </div>

        <div className="mt-6 text-center">
  <Link
    href="/school-list-items-kasoa"
    className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700"
  >
    View Full School List for All Classes
  </Link>
</div>

      </section>

      {/* ================= FEATURED ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Featured Products</h2>
          <Link href="/shop" className="text-sm font-semibold text-blue-900">
            View all →
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => scroll("left")} className="border px-3 py-2">←</button>

          <div
            ref={featuredRef}
            onMouseEnter={() => setPauseAuto(true)}
            onMouseLeave={() => setPauseAuto(false)}
            className="flex flex-1 gap-4 overflow-x-auto scroll-smooth"
          >
            {featured.map((p) => {
              const out = p.stockQty <= 0;

              return (
                <div key={p.id} className="min-w-[280px] rounded-2xl border bg-white p-4">
                  <Link href={`/product/${p.slug}`}>
                    <div className="relative h-52 bg-gray-50 overflow-hidden rounded-lg">
                      <Image
  src={p.imageSrc || "/products/placeholder.webp"}
  alt={p.name}
  fill
  className="object-contain p-3"
  sizes="(max-width: 768px) 100vw, 25vw"
  priority={false}
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
                          retailPrice: Number(p.retailPrice),
                          imageSrc: p.imageSrc,
                          stockQty: p.stockQty,
                        },
                        1
                      );

                      if (success) {
                        setAddedMap((prev) => ({ ...prev, [p.id]: true }));
                        setTimeout(() => {
                          setAddedMap((prev) => ({ ...prev, [p.id]: false }));
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

          <button onClick={() => scroll("right")} className="border px-3 py-2">→</button>
        </div>

      <div className="mt-6 text-center">
  <Link
    href="/school-list-items-kasoa"
    className="text-green-600 font-semibold hover:underline"
  >
    Looking for full school requirements? View full list →
  </Link>
</div>

      </section>

      {/* ================= SCHOOL LEVELS ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold">Shop by School Level</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {levels.map((level) => (
            <Link
              key={level}
              href={`/shop?level=${slugify(level)}`}
              className="rounded-full border px-4 py-2 hover:bg-gray-50"
            >
              {level}
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
  <Link
    href="/school-list-items-kasoa"
    className="inline-block border border-green-600 text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50"
  >
    See Complete School List (All Levels)
  </Link>
</div>

      </section>

    </main>
  );
}