"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function ShopClient({ products }: any) {
  const { addToCart } = useCart();

  const [query, setQuery] = useState("");
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p: any) =>
      p.name.toLowerCase().includes(q)
    );
  }, [query, products]);

  return (
    <main className="py-6">
      <section className="card-brand p-6">
        <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
          Shop All Products
        </h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="input-brand mt-6 w-full px-4 py-3"
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p: any) => {
            const pid = p.id;

            return (
              <Link
                key={pid}
                href={`/product/${p.slug}`}
                className="card-brand p-4"
              >
                <div className="mt-4 font-semibold">
                  {p.name}
                </div>

                <div className="mt-1 font-extrabold text-lg">
                  GH₵ {p.retailPrice}
                </div>

                <button
                  type="button"
                  className="btn-primary mt-4 w-full px-4 py-3"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    addToCart(
                      {
                        ...p,
                        price: p.retailPrice,
                      },
                      1
                    );

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
                  }}
                >
                  {addedMap[pid] ? "Added ✓" : "Add to cart"}
                </button>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
