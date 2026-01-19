"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { products } from "../lib/products";
import { useCart } from "@/app/context/CartContext";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Textbooks", value: "textbooks" },
  {
    label: "SHS Combined Edition Textbooks",
    value: "shs-combined-edition-textbooks",
  },
  {
    label: "JHS Combined Edition Textbooks",
    value: "jhs-combined-edition-textbooks",
  },
  { label: "Exam Materials", value: "exam-materials" },
  { label: "School Essentials", value: "school-essentials" },
  { label: "Dormitory Essentials", value: "dormitory-essentials" },
  {
    label: "Uniforms & Clothing Essentials",
    value: "uniforms-and-clothing-essentials",
  },
  { label: "Drawing & Technical", value: "drawing-and-technical" },
  { label: "Bags & Lunch Packs", value: "bags-and-lunch-packs" },
  { label: "Calculators", value: "calculators" },
];

const LEVEL_OPTIONS = [
  { label: "All Levels", value: "" },
  { label: "Pre-School", value: "pre-school" },
  { label: "Basic 1", value: "basic-1" },
  { label: "Basic 2", value: "basic-2" },
  { label: "Basic 3", value: "basic-3" },
  { label: "Basic 4", value: "basic-4" },
  { label: "Basic 5", value: "basic-5" },
  { label: "Basic 6", value: "basic-6" },
  { label: "JHS 1", value: "jhs-1" },
  { label: "JHS 2", value: "jhs-2" },
  { label: "JHS 3", value: "jhs-3" },
  { label: "SHS 1", value: "shs-1" },
  { label: "SHS 2", value: "shs-2" },
  { label: "SHS 3", value: "shs-3" },
];

export default function ShopPage() {
  const { addToCart } = useCart();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  // Read search query (?q=...) from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q") || "";
    const cat = params.get("category") || "";
    const lvl = params.get("level") || "";

    setQuery(q);
    setCategory(cat);
    setLevel(lvl);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p: any) => {
      const name = String(p?.name || "").toLowerCase();
      const cat = String(p?.categorySlug || "").toLowerCase();

      const levelsArray = Array.isArray(p?.levelSlugs) ? p.levelSlugs : [];
      const levels = levelsArray.join(" ").toLowerCase();

      const matchesSearch =
        !q || name.includes(q) || cat.includes(q) || levels.includes(q);

      const matchesCategory = !category || p?.categorySlug === category;

      const matchesLevel = !level || levelsArray.includes(level);

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [query, category, level]);

  return (
    <main className="py-6">
      <section className="card-brand p-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
              Shop All Products
            </h1>

            <p className="mt-2 text-[color:var(--text-muted)]">
              Browse our products and order for delivery.
            </p>

            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Showing{" "}
              <span className="font-semibold text-[color:var(--text-main)]">
                {filteredProducts.length}
              </span>{" "}
              product{filteredProducts.length === 1 ? "" : "s"}.
            </p>
          </div>

          {/* Clear Filters */}
          <div className="mt-2 sm:mt-0">
            <button
              onClick={() => {
                setQuery("");
                setCategory("");
                setLevel("");
              }}
              className="btn-outline px-5 py-3 text-sm text-[color:var(--brand-blue)] hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Search */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products... (e.g. Chemistry, Biology)"
            className="input-brand w-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-brand w-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.label} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Level */}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="input-brand w-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
          >
            {LEVEL_OPTIONS.map((l) => (
              <option key={l.label} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p: any) => {
              const imageSrc = p?.image?.src || "/products/placeholder.webp";
              const imageAlt = p?.image?.alt || p?.name || "DeeglobalGh product";
              const imageTitle =
                p?.image?.title || p?.name || "Product image";

              return (
                <Link
                  key={p?.id}
                  href={`/product/${p?.slug}`}
                  className="card-brand p-4 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-52 items-center justify-center overflow-hidden rounded-2xl border bg-white">
                    <img
                      src={imageSrc}
                      alt={imageAlt}
                      title={imageTitle}
                      className="h-48 w-auto object-contain p-2"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-4 font-semibold text-[color:var(--text-main)]">
                    {p?.name}
                  </div>

                  <div className="mt-1 font-extrabold text-lg text-[color:var(--brand-blue)]">
                    GH₵ {p?.price}
                  </div>

                  <button
                    type="button"
                    className="btn-primary mt-4 w-full px-4 py-3"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(p, 1);
                    }}
                  >
                    Add to cart
                  </button>
                </Link>
              );
            })
          ) : (
            <div className="card-brand p-6 text-[color:var(--text-muted)]">
              No products match your filters.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
