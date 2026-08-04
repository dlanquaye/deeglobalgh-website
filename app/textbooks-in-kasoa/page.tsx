export const metadata = {
  title: "Textbooks in Kasoa | Buy School Books in Kasoa - DeeglobalGh",
  description:
    "Buy textbooks in Kasoa for Basic, JHS, and SHS. Fast delivery available. Order school books online in Kasoa today.",
  alternates: {
    canonical: "https://www.shopdeeglobalgh.com/textbooks-in-kasoa",
  },
};

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function TextbooksKasoaPage({
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
     QUERY BUILD (SAFE + CLEAN)
  ------------------------------------------- */
  const where: any = {
  isActive: true,
  websiteVisible: true,
  AND: [],
};

  /* CATEGORY (default = textbooks) */
  where.AND.push(
    category ? { categorySlug: category } : { categorySlug: "textbooks" }
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
        Textbooks in Kasoa – Buy School Books Near You
      </h1>

      <p className="text-gray-600 max-w-2xl mb-4">
        Looking for textbooks in Kasoa? DeeglobalGh provides approved textbooks
        for Pre-School, Basic 1–6, JHS, and SHS students. Order online and get
        fast delivery in Kasoa.
      </p>

      <p className="text-gray-600 max-w-2xl mb-6">
        We stock Ghana Education Service recommended textbooks, exam materials,
        and learning resources to help students succeed.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
  <Link
    href="/stationery-in-kasoa"
    className="border px-4 py-2 rounded-xl hover:bg-gray-100"
  >
    Shop Stationery in Kasoa
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
          href="/shop?category=textbooks"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Shop All Textbooks
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
          placeholder="Search textbooks..."
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
              href={`/textbooks-in-kasoa?${params.toString()}`}
              className="border px-3 py-1 rounded-full text-sm hover:bg-gray-100"
            >
              {lvl.toUpperCase()}
            </Link>
          );
        })}
      </div>

      {/* ================= PRODUCTS ================= */}
      <h2 className="text-xl font-bold mb-6">Available Textbooks</h2>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-semibold text-gray-700">
            No textbooks found.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try different keywords or browse all textbooks.
          </p>

          <Link
            href="/shop?category=textbooks"
            className="inline-block mt-4 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            View All Textbooks
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
          Where to buy textbooks in Kasoa
        </h2>

        <p className="text-gray-600 mb-3">
          Parents and students in Kasoa can easily order textbooks online from
          DeeglobalGh. We offer fast delivery and a wide range of textbooks for
          all levels.
        </p>

        <p className="text-gray-600">
          Whether you need Basic school textbooks, JHS materials, or SHS approved
          books, you can find them here and order quickly for delivery.
        </p>
      </div>

    </div>
  );
}