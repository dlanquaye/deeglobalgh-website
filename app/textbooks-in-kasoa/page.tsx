import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function TextbooksKasoaPage({
  searchParams,
}: {
  searchParams: { search?: string; level?: string; category?: string };
}) {
  /* -------------------------------------------
     PARAMS
  ------------------------------------------- */
  const rawSearch = searchParams?.search || "";
  const rawLevel = searchParams?.level || "";
  const rawCategory = searchParams?.category; // ❌ NO DEFAULT HERE

  /* -------------------------------------------
     NORMALIZE
  ------------------------------------------- */
  const search = rawSearch.toLowerCase().trim();
  const level = rawLevel.toLowerCase().trim();
  const category = rawCategory?.toLowerCase().trim();

  const keywords = search.split(" ").filter(Boolean);

  /* -------------------------------------------
     FETCH PRODUCTS (FIXED LOGIC)
  ------------------------------------------- */
  const products = await prisma.product.findMany({
    where: {
      isActive: true,

      AND: [
        /* ✅ CATEGORY (DEFAULT = TEXTBOOKS ONLY WHEN NONE SELECTED) */
        category
          ? { categorySlug: category }
          : { categorySlug: "textbooks" },

        /* SEARCH */
        ...(keywords.length > 0
          ? keywords.map((word) => ({
              OR: [
  { name: { contains: word } },
  { brand: { contains: word } },
  { tags: { has: word } },
]
            }))
          : []),

        /* LEVEL */
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

  /* -------------------------------------------
     UI
  ------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-2">
        Buy Textbooks in Kasoa
      </h1>

      <p className="text-gray-600 mb-6">
        Shop textbooks for Pre-School, Basic 1–6, JHS and SHS. Fast delivery available.
      </p>

      {/* CTA */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link
          href="/textbooks-in-kasoa?category=textbooks"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Browse Textbooks
        </Link>

        <a
          href="https://wa.me/233246011773"
          target="_blank"
          className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
        >
          Order on WhatsApp
        </a>
      </div>

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
      <div className="mb-4 flex flex-wrap gap-2">
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
        ].map((lvl) => (
          <Link
            key={lvl}
            href={`/textbooks-in-kasoa?level=${lvl}${
              rawSearch ? `&search=${rawSearch}` : ""
            }${
              category ? `&category=${category}` : ""
            }`}
            className="border px-3 py-1 rounded-full text-sm hover:bg-gray-100"
          >
            {lvl.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* CATEGORY QUICK SWITCH (SAFE VERSION) */}
      

      <h2 className="text-xl font-bold mb-6">Shop</h2>

      {/* PRODUCTS */}
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}