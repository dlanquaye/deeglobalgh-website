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
  const keywords = search.split(" ").filter(Boolean);
  const level = rawLevel.toLowerCase().trim();
  const category = rawCategory.toLowerCase().trim();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      AND: [
        ...(category ? [{ categorySlug: category }] : []),

        ...(keywords.length > 0
  ? keywords.map((word) => ({
      OR: [
        {
          name: {
            contains: word,
            mode: "insensitive" as const,
          },
        },
        {
          brand: {
            contains: word,
            mode: "insensitive" as const,
          },
        },
      ],
    }))
  : []),
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="bg-gray-50 min-h-screen">

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 text-white p-6 shadow-lg">
          <h1 className="text-2xl font-bold">
            Shop Textbooks, Stationery & School Essentials
          </h1>

          <p className="text-white/90 mt-2">
            Browse NaCCA approved textbooks, exam materials, and school supplies.
            Fast delivery across Kasoa, Accra, and Ghana.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://wa.me/233246011773"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-semibold"
            >
              Order Now via WhatsApp
            </a>

            <Link
              href="/school-list-items-kasoa"
              className="bg-green-500 text-white px-5 py-2 rounded-xl font-semibold"
            >
              View Full School List
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto max-w-6xl px-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4 text-sm bg-white">
          <strong>NaCCA Approved</strong>
          <p className="text-gray-600">
            All textbooks follow Ghana’s new curriculum.
          </p>
        </div>

        <div className="border rounded-xl p-4 text-sm bg-white">
          <strong>Complete School Supplies</strong>
          <p className="text-gray-600">
            Everything in one place for students.
          </p>
        </div>

        <div className="border rounded-xl p-4 text-sm bg-white">
          <strong>Fast Delivery</strong>
          <p className="text-gray-600">
            Reliable delivery across Ghana.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-8">

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
                className="px-4 py-2 rounded-xl text-sm font-medium 
bg-white border border-gray-200 
shadow-sm hover:shadow-md 
hover:border-blue-400 
hover:bg-blue-50 
transition"
              >
                {lvl.toUpperCase()}
              </Link>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold mb-6">All Products</h2>

        {/* PRODUCTS */}
        <ShopClient products={products} />

      </section>
    </main>
  );
}