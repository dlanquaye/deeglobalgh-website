"use client";

import ProductCard from "@/app/components/ProductCard";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const levels = [
  { name: "Pre-School", slug: "pre-school" },
  { name: "Basic 1", slug: "basic-1" },
  { name: "Basic 2", slug: "basic-2" },
  { name: "Basic 3", slug: "basic-3" },
  { name: "Basic 4", slug: "basic-4" },
  { name: "Basic 5", slug: "basic-5" },
  { name: "Basic 6", slug: "basic-6" },
  { name: "JHS", slug: "jhs" },
  { name: "SHS", slug: "shs" },
];

const categories = [
  { name: "Textbooks", slug: "textbooks" },
  { name: "Stationery", slug: "stationery" },
  { name: "School Supplies", slug: "school-supplies" },
];

type ShopClientProps = {
  products: any[];
};

export default function ShopClient({ products }: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedLevel = searchParams.get("level");
  const selectedCategory = searchParams.get("category");

  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentlyViewed");

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setRecentProducts(parsed.slice(0, 4));
      }
    } catch {
      setRecentProducts([]);
    }
  }, []);

  const formatLevelName = (slug: string) => {
    return slug
      .split("-")
      .map((word) =>
        word === "jhs" || word === "shs"
          ? word.toUpperCase()
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const changeFilter = (
    key: "level" | "category",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set(key, value);

    // Any filter change starts again from the first results page.
    params.delete("page");

    router.push(`/shop?${params.toString()}`, {
      scroll: false,
    });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("level");
    params.delete("category");
    params.delete("page");

    const query = params.toString();

    router.push(query ? `/shop?${query}` : "/shop", {
      scroll: false,
    });
  };

  /*
   * The server already performs search, level and category filtering.
   * Do not filter the supplied result set again here. This is important
   * for server-side pagination because each page must represent the exact
   * database result set returned by the server.
   */
  const topPicks = products.slice(0, 4);
  const remainingProducts = products.slice(4);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Shop</h1>

      <div className="mt-3 text-sm font-medium text-gray-700">
        Fast delivery across Kasoa, Accra &amp; Ghana &bull; Chat us on
        WhatsApp to order instantly
      </div>

      {/* LEVEL FILTER */}
      <div className="mt-4 flex flex-wrap gap-2">
        {levels.map((level) => {
          const isActive = selectedLevel === level.slug;

          return (
            <button
              key={level.slug}
              type="button"
              onClick={() => changeFilter("level", level.slug)}
              className={`rounded-full border px-4 py-2 transition-all duration-200 ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {level.name}
            </button>
          );
        })}
      </div>

      {/* CATEGORY FILTER */}
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category.slug;

          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => changeFilter("category", category.slug)}
              className={`rounded-full border px-4 py-2 transition-all duration-200 ${
                isActive
                  ? "border-green-600 bg-green-600 text-white shadow-md"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* CLEAR FILTERS */}
      {(selectedLevel || selectedCategory) && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-2 text-sm text-red-600 underline"
        >
          Clear Filters
        </button>
      )}

      {/* ACTIVE FILTER LABEL */}
      {(selectedLevel || selectedCategory) && (
        <p className="mt-2 text-sm text-gray-600">
          Showing:{" "}
          <span className="font-semibold">
            {selectedLevel ? formatLevelName(selectedLevel) : ""}
            {selectedLevel && selectedCategory && " • "}
            {selectedCategory
              ? categories.find(
                  (category) => category.slug === selectedCategory
                )?.name
              : ""}
          </span>
        </p>
      )}

      {/* RECENTLY VIEWED */}
      {recentProducts.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">
            Continue Browsing
          </h2>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {recentProducts.map((product: any) => (
              <ProductCard
                key={`recent-${product.id}`}
                product={product}
              />
            ))}
          </div>
        </div>
      )}

      {/* CURRENT RESULT PAGE */}
      {products.length > 0 ? (
        <>
          {topPicks.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold">
                Top Picks for You
              </h2>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {topPicks.map((product: any) => (
                  <ProductCard
                    key={`top-${product.id}`}
                    product={product}
                  />
                ))}
              </div>
            </div>
          )}

          {remainingProducts.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 text-lg font-semibold">
                More Products
              </h2>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {remainingProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="mt-8 rounded-xl border bg-white p-6 text-center">
          <h2 className="font-semibold text-gray-900">
            No matching products found
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Try another search, level or category.
          </p>
        </div>
      )}
    </div>
  );
}