"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "./lib/products";
import { useCart } from "@/app/context/CartContext";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function Home() {
  const router = useRouter();
  const { addToCart, totalItems } = useCart();

  const [search, setSearch] = useState("");

  // Featured products (randomized AFTER page loads to avoid hydration error)
  const [featured, setFeatured] = useState(products.slice(0, 6));

  // "Added ✓" feedback per product
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // pause autoplay on hover
  const [pauseFeaturedAutoScroll, setPauseFeaturedAutoScroll] = useState(false);

  const categories = useMemo(
    () => [
      { name: "Textbooks", desc: "Pre-School to SHS" },
      { name: "JHS Combined Edition Textbooks", desc: "JHS 1–3 combined books" },
      { name: "SHS Combined Edition Textbooks", desc: "SHS 1–3 combined books" },

      // ✅ Past Questions category landing page
      {
        name: "Exam Past Questions",
        desc: "BECE & WASSCE",
        href: "/category/exam-past-questions",
      },

      { name: "Exam Materials", desc: "BECE & WASSCE" },
      { name: "School Essentials", desc: "Stationery & supplies" },
      { name: "Dormitory Essentials", desc: "Boarding student items" },
      {
        name: "Uniforms & Clothing Essentials",
        desc: "Underwear, socks & uniforms",
      },
      { name: "Drawing & Technical", desc: "Drawing boards & sets" },
      { name: "Bags & Lunch Packs", desc: "Bags, lunch boxes, bottles" },
      { name: "Calculators", desc: "Scientific calculators" },
    ],
    []
  );

  const levels = useMemo(
    () => [
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
    ],
    []
  );

  useEffect(() => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    setFeatured(shuffled.slice(0, 6));
  }, []);

  const hasEnoughProductsForCarousel = featured.length >= 6;

  // Carousel scroll ref
  const featuredRef = useRef<HTMLDivElement | null>(null);

  const scrollFeatured = useCallback((dir: "left" | "right") => {
    const el = featuredRef.current;
    if (!el) return;

    const amount = dir === "left" ? -320 : 320;
    el.scrollBy({ left: amount, behavior: "smooth" });

    // wrap back to start if near the end
    if (dir === "right") {
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 40;
      if (nearEnd) {
        setTimeout(() => {
          el.scrollTo({ left: 0, behavior: "smooth" });
        }, 600);
      }
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!hasEnoughProductsForCarousel) return;
    if (pauseFeaturedAutoScroll) return;

    const id = setInterval(() => {
      scrollFeatured("right");
    }, 5000);

    return () => clearInterval(id);
  }, [scrollFeatured, hasEnoughProductsForCarousel, pauseFeaturedAutoScroll]);

  return (
    <main className="min-h-screen bg-white">
      {/* Homepage Header */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          {/* Top row: Brand + Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="font-bold text-lg text-blue-900 whitespace-nowrap">
              DeeglobalGh
            </div>

            {/* Big Search */}
            <div className="flex-1">
              <div className="flex items-center gap-2 rounded-xl border bg-white px-2 py-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = search.trim();
                      if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
                      else router.push("/shop");
                    }
                  }}
                  className="w-full bg-transparent px-2 py-2 text-base outline-none"
                  placeholder="Search books, stationery, dorm items, underwear..."
                />

                <button
                  onClick={() => {
                    const q = search.trim();
                    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
                    else router.push("/shop");
                  }}
                  className="shrink-0 rounded-lg bg-blue-900 px-4 py-2 text-sm font-extrabold text-white hover:opacity-90"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Kasoa SEO Links (MOBILE FIX: grid on mobile, flex on desktop) */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/kasoa"
              className="rounded-xl border px-4 py-3 text-center font-medium hover:bg-gray-50"
            >
              Kasoa
            </Link>

            <Link
              href="/textbooks-in-kasoa"
              className="rounded-xl border px-4 py-3 text-center font-medium hover:bg-gray-50"
            >
              Textbooks in Kasoa
            </Link>

            <Link
              href="/stationery-in-kasoa"
              className="rounded-xl border px-4 py-3 text-center font-medium hover:bg-gray-50"
            >
              Stationery in Kasoa
            </Link>

            {/* Cart badge */}
            <Link
              href="/cart"
              className="relative rounded-xl border px-4 py-3 text-center font-medium hover:bg-gray-50"
            >
              Cart
              {totalItems > 0 ? (
                <span className="absolute -top-2 -right-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-600 px-2 text-xs font-extrabold text-white">
                  {totalItems}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border bg-gray-50 p-6">
          <h1 className="text-2xl font-bold">
            Shop Textbooks, Stationery & School Essentials in Ghana
          </h1>
          <p className="mt-2 text-gray-700">
            Fast delivery. Secure checkout. Easy shopping for parents and
            students.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 font-extrabold text-white hover:opacity-90"
            >
              Shop All Products
            </Link>

            <a
              href="https://wa.me/233246011773"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-5 py-3 font-extrabold text-blue-950 hover:opacity-90"
            >
              WhatsApp Support
            </a>

            <Link
              href="/kasoa"
              className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-extrabold text-blue-900 hover:bg-gray-50"
            >
              Shop in Kasoa
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-xl font-bold">Shop by Category</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const slug = slugify(c.name);
            const href = (c as any).href || `/shop?category=${slug}`;

            return (
              <Link
                key={c.name}
                href={href}
                className="cursor-pointer rounded-2xl border p-5 hover:bg-gray-50"
              >
                <div className="text-lg font-semibold">{c.name}</div>
                <div className="mt-1 text-sm text-gray-600">{c.desc}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
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

        <p className="mt-2 text-gray-700">
          Popular picks you can order quickly for delivery.
        </p>

        {hasEnoughProductsForCarousel ? (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => scrollFeatured("left")}
              className="rounded-full border bg-white px-3 py-2 font-bold hover:bg-gray-50"
              aria-label="Scroll left"
            >
              ←
            </button>

            <div
              ref={featuredRef}
              onMouseEnter={() => setPauseFeaturedAutoScroll(true)}
              onMouseLeave={() => setPauseFeaturedAutoScroll(false)}
              className="flex flex-1 gap-4 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
            >
              {featured.map((p) => {
                const imageSrc =
                  p?.image?.src || "/products/placeholder.webp";
                const imageAlt =
                  p?.image?.alt || p?.name || "DeeglobalGh product";
                const imageTitle =
                  p?.image?.title || p?.name || "Product image";

                const pid = String(p?.id || p?.slug);

                return (
                  <div
                    key={pid}
                    className="min-w-[280px] max-w-[280px] snap-start rounded-2xl border bg-white p-4 transition hover:-translate-y-1 hover:bg-gray-50"
                  >
                    {/* ✅ Link only wraps product details */}
                    <Link href={`/product/${p.slug}`} className="block">
                      <div className="relative h-52 w-full overflow-hidden rounded-xl bg-gray-50">
                        <Image
                          src={imageSrc}
                          alt={imageAlt}
                          title={imageTitle}
                          fill
                          sizes="(max-width: 640px) 100vw, 280px"
                          className="object-contain p-3"
                        />
                      </div>

                      <div className="mt-3 font-semibold">{p.name}</div>
                      <div className="mt-1 text-lg font-extrabold text-blue-900">
                        GH₵ {p.price}
                      </div>
                    </Link>

                    {/* ✅ Add to Cart OUTSIDE Link */}
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(p, 1);

                        setAddedMap((prev) => ({ ...prev, [pid]: true }));

                        window.setTimeout(() => {
                          setAddedMap((prev) => ({ ...prev, [pid]: false }));
                        }, 2000);
                      }}
                      className="mt-3 w-full rounded-xl bg-yellow-500 px-4 py-3 text-center font-extrabold text-blue-950 hover:opacity-90"
                    >
                      {addedMap[pid] ? "Added ✓" : "Add to cart"}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => scrollFeatured("right")}
              className="rounded-full border bg-white px-3 py-2 font-bold hover:bg-gray-50"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border bg-white p-5 text-sm text-gray-700">
            Not enough featured products yet. More items are being added daily.
            Check back soon or{" "}
            <Link
              href="/shop"
              className="font-bold text-blue-900 hover:underline"
            >
              view all products
            </Link>
            .
          </div>
        )}
      </section>

      {/* Shop by Level */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold">Shop by School Level</h2>
        <p className="mt-2 text-gray-700">
          Choose the class level and get the right items faster.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {levels.map((level) => {
            const slug = slugify(level);

            return (
              <Link
                key={level}
                href={`/shop?level=${slug}`}
                className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                {level}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust Section */}
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

          {/* NAP Block */}
          <div className="mt-10 rounded-2xl border bg-white p-6 text-sm text-gray-700">
            <div className="text-base font-bold text-blue-900">DeeglobalGh</div>

            <div className="mt-2">
              <span className="font-semibold">Location:</span> Kasoa, Ghana
            </div>

            <div className="mt-1">
              <span className="font-semibold">WhatsApp:</span>{" "}
              <a href="https://wa.me/233246011773" className="underline">
                0246 011 773
              </a>
            </div>

            <div className="mt-1">
              <span className="font-semibold">Call:</span> 054 113 1111 / 030 398
              2358
            </div>

            <div className="mt-5 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} DeeglobalGh. All rights reserved.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
