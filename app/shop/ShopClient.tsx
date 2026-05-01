"use client";

import ProductCard from "@/app/components/ProductCard";
import { useState, useEffect } from "react";
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

export default function ShopClient({ products }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialLevel = searchParams.get("level");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(initialLevel);

  const initialCategory = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const filteredProducts = products
  .filter((p: any) => {
    const matchLevel =
      !selectedLevel ||
      (Array.isArray(p.levelSlugs) &&
        p.levelSlugs.includes(selectedLevel));

    const matchCategory =
      !selectedCategory ||
      p.categorySlug === selectedCategory;

    return matchLevel && matchCategory;
  })
  .sort((a: any, b: any) => {
  const getScore = (p: any) => {
    let score = 0;

    // PRIORITY 1: Textbooks
    if (p.name?.toLowerCase().includes("textbook")) score += 5;

    // PRIORITY 2: Lower classes (higher demand)
    if (p.levelSlugs?.includes("basic-1")) score += 3;
    if (p.levelSlugs?.includes("basic-2")) score += 2;

    // PRIORITY 3: Has image (better visual product)
    if (p.imageSrc) score += 1;

    return score;
  };

  return getScore(b) - getScore(a);
});

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

  useEffect(() => {
  const stored = localStorage.getItem("recentlyViewed");
  if (stored) {
    setRecentProducts(JSON.parse(stored));
  }
}, []);

  const topPicks = filteredProducts.slice(0, 4);
  const remainingProducts = filteredProducts.slice(4);
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Shop</h1>
      <div className="mt-3 text-sm text-gray-700 font-medium">
  🚚 Fast delivery across Kasoa, Accra & Ghana • Chat us on WhatsApp to order instantly
</div>

      {/* LEVEL FILTER */}
      <div className="flex flex-wrap gap-2 mt-4">
        {levels.map((level) => {
          const isActive = selectedLevel === level.slug;

          return (
            <button
              key={level.slug}
              onClick={() => {
                setSelectedLevel(level.slug);

                const params = new URLSearchParams(searchParams.toString());
                params.set("level", level.slug);

                router.push(`/shop?${params.toString()}`, { scroll: false });
              }}
              className={`px-4 py-2 rounded-full border transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              {level.name}
            </button>
          );
        })}
      </div>

      {/* CATEGORY FILTER (CORRECT POSITION) */}
      <div className="flex flex-wrap gap-2 mt-3">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;

          return (
            <button
              key={cat.slug}
              onClick={() => {
                setSelectedCategory(cat.slug);

                const params = new URLSearchParams(searchParams.toString());
                params.set("category", cat.slug);

                router.push(`/shop?${params.toString()}`, { scroll: false });
              }}
              className={`px-4 py-2 rounded-full border transition-all duration-200
                ${
                  isActive
                    ? "bg-green-600 text-white border-green-600 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* CLEAR FILTER */}
      {(selectedLevel || selectedCategory) && (
  <button
    onClick={() => {
      setSelectedLevel(null);
      setSelectedCategory(null);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("level");
      params.delete("category");

      router.push(`/shop?${params.toString()}`, { scroll: false });
    }}
    className="text-sm text-red-600 underline mt-2"
  >
    Clear Filters
  </button>
)}
          
     

      {/* ACTIVE LABEL */}
      {(selectedLevel || selectedCategory) && (
  <p className="text-sm text-gray-600 mt-2">
    Showing:{" "}
    <span className="font-semibold">
      {selectedLevel ? formatLevelName(selectedLevel) : ""}
      {selectedLevel && selectedCategory && " • "}
      {selectedCategory
        ? categories.find(c => c.slug === selectedCategory)?.name
        : ""}
    </span>
  </p>
)}
{recentProducts.length > 0 && (
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-3">
      Continue Browsing
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {recentProducts.map((product: any) => (
        <ProductCard key={`recent-${product.id}`} product={product} />
      ))}
    </div>
  </div>
)}
      {/* PRODUCTS */}
    
  <>
    {/* TOP PICKS */}
    {topPicks.length > 0 && (
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">
          Top Picks for You
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {topPicks.map((product: any) => (
            <ProductCard key={`top-${product.id}`} product={product} />
          ))}
        </div>
      </div>
    )}

    <h2 className="text-lg font-semibold mt-4 mb-3">
  All Products
</h2>

    {/* ALL PRODUCTS */}
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
      {remainingProducts.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </>

    </div>
  );
}