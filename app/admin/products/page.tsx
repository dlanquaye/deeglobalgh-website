"use client";

import { useMemo, useState } from "react";
import { products } from "../../lib/products";

export default function AdminProductsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      const text = `${p.id} ${p.name} ${p.categorySlug} ${p.levelSlugs.join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }, [query]);

  const jsonTemplate = `{
  "id": "DG0004",
  "name": "Product Name Here",
  "price": 0,
  "image": "/products/image-file.webp",
  "categorySlug": "textbooks",
  "levelSlugs": ["shs-1"]
}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-900">Admin • Products</h1>
      <p className="mt-2 text-gray-700">
        This page helps you manage and verify products.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, code, category, level..."
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
        />

        <button
          className="rounded-xl bg-blue-900 px-4 py-3 font-extrabold text-white hover:opacity-90"
          onClick={async () => {
            await navigator.clipboard.writeText(jsonTemplate);
            alert("JSON template copied!");
          }}
        >
          Copy JSON Template
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Showing <span className="font-semibold">{filtered.length}</span> product
        {filtered.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-6 space-y-4">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-bold text-blue-900">
                  {p.id} • {p.name}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Category: <span className="font-semibold">{p.categorySlug}</span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Levels: <span className="font-semibold">{p.levelSlugs.join(", ")}</span>
                </div>
              </div>

              <div className="text-lg font-extrabold text-blue-900">
                GH₵ {p.price}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href={`/product/${p.slug ?? p.slug}`}
                className="inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold hover:bg-gray-50"
              >
                View Product Page
              </a>

              <button
                className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-4 py-3 text-sm font-extrabold text-blue-950 hover:opacity-90"
                onClick={async () => {
                  const json = JSON.stringify(p, null, 2);
                  await navigator.clipboard.writeText(json);
                  alert("Product JSON copied!");
                }}
              >
                Copy Product JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
