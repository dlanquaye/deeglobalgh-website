"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { products } from "../lib/products";

export default function ShopPage() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setQuery(q);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Shop All Products</h1>
      <p className="mt-2 text-gray-700">
        Browse our products and order for delivery.
      </p>

      {/* Search */}
      <div className="mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products... (e.g. Chemistry, Biology)"
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Product Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="rounded-2xl border bg-white p-4 hover:bg-gray-50"
            >
              <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-48 w-auto object-contain"
                />
              </div>

              <div className="mt-3 font-semibold">{p.name}</div>
              <div className="mt-1 font-bold text-lg">GH₵ {p.price}</div>

              <button
                className="mt-3 w-full rounded-xl bg-black px-4 py-3 font-semibold text-white hover:opacity-90"
                onClick={(e) => {
                  e.preventDefault(); // prevents opening product page
                  alert("Cart feature coming soon!");
                }}
              >
                Add to cart
              </button>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border bg-white p-6 text-gray-700">
            No products match your search.
          </div>
        )}
      </div>
    </main>
  );
}
