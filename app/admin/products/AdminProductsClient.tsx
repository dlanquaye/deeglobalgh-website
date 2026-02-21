"use client";

import { useMemo, useState } from "react";

type AdminProduct = {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  retailPrice: number;
  categorySlug: string;
  levelSlugs: string[];
};

export default function AdminProductsPage({
  initialProducts,
}: {
  initialProducts: AdminProduct[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialProducts;

    return initialProducts.filter((p) => {
      const text = `${p.sku ?? ""} ${p.name} ${p.categorySlug} ${
        p.levelSlugs?.join(" ") ?? ""
      }`.toLowerCase();
      return text.includes(q);
    });
  }, [query, initialProducts]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-900">
        Admin • Products
      </h1>

      <div className="mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by SKU, name, category, level..."
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-900"
        />
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold">{filtered.length}</span>{" "}
        product{filtered.length === 1 ? "" : "s"}.
      </p>

      <div className="mt-6 space-y-4">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-bold text-blue-900">
                  {p.sku ?? p.id} • {p.name}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Category:{" "}
                  <span className="font-semibold">
                    {p.categorySlug}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Levels:{" "}
                  <span className="font-semibold">
                    {p.levelSlugs?.join(", ")}
                  </span>
                </div>
              </div>

              <div className="text-lg font-extrabold text-blue-900">
                GH₵ {p.retailPrice}
              </div>
            </div>

            <div className="mt-4">
              <a
                href={`/product/${p.slug}`}
                className="inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold hover:bg-gray-50"
              >
                View Product Page
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
