/* ================= SEO METADATA ================= */
export const metadata = {
  title:
    "Stationery in Kasoa | Buy School Supplies in Kasoa | DeeglobalGh",
  description:
    "Buy stationery in Kasoa including pens, pencils, rulers, calculators, and school essentials. Fast delivery available in Kasoa.",
  alternates: {
    canonical: "https://www.shopdeeglobalgh.com/stationery-in-kasoa",
  },
};

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";

export const dynamic = "force-dynamic";



export default async function StationeryKasoaPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    level?: string;
    category?: string;
  };
}) {
  /* -------------------------------------------
     PARAMS
  ------------------------------------------- */
  const rawSearch = searchParams?.search || "";
  const rawLevel = searchParams?.level || "";
  const rawCategory = searchParams?.category;

  /* -------------------------------------------
     NORMALIZE
  ------------------------------------------- */
  const search = rawSearch.toLowerCase().trim();
  const level = rawLevel.toLowerCase().trim();
  const category = rawCategory?.toLowerCase().trim();

  const keywords = search.split(" ").filter(Boolean);

  /* -------------------------------------------
     QUERY BUILD
  ------------------------------------------- */
  const where: any = {
  isActive: true,
  websiteVisible: true,
  AND: [],
};

  /* CATEGORY (default = stationery) */
  where.AND.push(
    category ? { categorySlug: category } : { categorySlug: "stationery" }
  );

  /* SEARCH */
  if (keywords.length > 0) {
    where.AND.push(
      ...keywords.map((word) => ({
        OR: [
          { name: { contains: word } },
          { brand: { contains: word } },
          { tags: { has: word } },
        ],
      }))
    );
  }

  /* LEVEL */
  if (level) {
    where.AND.push({
      levelSlugs: {
        has: level,
      },
    });
  }

  /* -------------------------------------------
     FETCH
  ------------------------------------------- */
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  /* -------------------------------------------
     UI
  ------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* ================= SEO HEADER ================= */}
      <h1 className="text-3xl font-bold text-blue-900 mb-4">
        Stationery in Kasoa – Buy School Supplies Near You
      </h1>

      <p className="text-gray-600 max-w-2xl mb-4">
        Looking for stationery in Kasoa? DeeglobalGh provides school supplies
        for Pre-School, Basic, JHS, and SHS students. Order online and get fast
        delivery in Kasoa.
      </p>

      <p className="text-gray-600 max-w-2xl mb-6">
        Shop pens, pencils, rulers, erasers, calculators, and other essential
        school items at affordable prices.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
  <Link
    href="/textbooks-in-kasoa"
    className="border px-4 py-2 rounded-xl hover:bg-gray-100"
  >
    Shop Textbooks in Kasoa
  </Link>

  <Link
    href="/exam-materials-in-kasoa"
    className="border px-4 py-2 rounded-xl hover:bg-gray-100"
  >
    Buy Exam Materials in Kasoa
  </Link>
</div>

      {/* CTA */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link
          href="/shop?category=stationery"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Shop All Stationery
        </Link>

        <a
          href="https://wa.me/233246011773"
          target="_blank"
          className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
        >
          Order on WhatsApp
        </a>
      </div>

      {/* ================= SEARCH ================= */}
      <form method="GET" className="mb-6 flex gap-3">
        <input
          type="text"
          name="search"
          defaultValue={rawSearch}
          placeholder="Search stationery..."
          className="flex-1 border rounded-xl px-4 py-3"
        />
        <button className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold">
          Search
        </button>
      </form>

      {/* ================= LEVEL FILTER ================= */}
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
          if (category) params.set("category", category);

          params.set("level", lvl);

          return (
            <Link
              key={lvl}
              href={`/stationery-in-kasoa?${params.toString()}`}
              className="border px-3 py-1 rounded-full text-sm hover:bg-gray-100"
            >
              {lvl.toUpperCase()}
            </Link>
          );
        })}
      </div>

      {/* ================= PRODUCTS ================= */}
      <h2 className="text-xl font-bold mb-6">Available Stationery</h2>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-semibold text-gray-700">
            No stationery found.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try different keywords or browse all stationery.
          </p>

          <Link
            href="/shop?category=stationery"
            className="inline-block mt-4 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            View All Stationery
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* ================= SEO FOOTER ================= */}
      <div className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold mb-3">
          Where to buy stationery in Kasoa
        </h2>

        <p className="text-gray-600 mb-3">
          Parents and students in Kasoa can easily buy stationery online from
          DeeglobalGh. We provide reliable delivery and a wide range of school
          supplies.
        </p>

        <p className="text-gray-600">
          From pens and pencils to calculators and exam tools, you can find all
          your school essentials in one place and order easily.
        </p>
      </div>

    </div>
  );
}