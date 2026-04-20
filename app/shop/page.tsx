import { prisma } from "../../lib/prisma";
import Link from "next/link";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; level?: string; category?: string }>;
}) {
  // ✅ unwrap the Promise
  const params = await searchParams;

  const rawSearch = params?.search || "";
  const rawLevel = params?.level || "";
  const rawCategory = params?.category || "";

  const search = rawSearch.toLowerCase().trim();
  const level = rawLevel.toLowerCase().trim();
  const category = rawCategory.toLowerCase().trim();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      AND: [
        ...(category ? [{ categorySlug: category }] : []),

        ...(search
          ? [
              {
                OR: [
                  {
                    name: {
                      contains: search,
                    },
                  },
                  {
                    brand: {
                      contains: search,
                    },
                  },
                  { tags: { has: search } },
                ],
              },
            ]
          : []),

        ...(level
          ? [
              {
                levelSlugs: {
                  has: level,
                },
              },
            ]
          : []),
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* SEARCH */}
      <form method="GET" className="mb-6 flex gap-3">
        <input
          type="text"
          name="search"
          defaultValue={rawSearch}
          placeholder="Search textbooks..."
          className="flex-1 border rounded-xl px-4 py-3"
        />
        <button className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold">
          Search
        </button>
      </form>

      {/* LEVEL FILTER */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          "pre-school",
          "basic-1",
          "basic-2",
          "basic-3",
          "basic-4",
          "basic-5",
          "basic-6",
          "jhs",
          "shs",
        ].map((lvl) => {
          const params = new URLSearchParams();

          if (rawSearch) params.set("search", rawSearch);
          if (rawCategory) params.set("category", rawCategory);

          params.set("level", lvl);

          return (
            <Link
              key={lvl}
              href={`/shop?${params.toString()}`}
              className="border px-3 py-1 rounded-full text-sm hover:bg-gray-100"
            >
              {lvl.toUpperCase()}
            </Link>
          );
        })}
      </div>

      <h1 className="text-2xl font-bold mb-6">Shop</h1>

      {/* PRODUCTS */}
      <ShopClient products={products} />
    </div>
  );
}