import { prisma } from "../../lib/prisma";
import Link from "next/link";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    level?: string;
    category?: string;
  }>;
}) {
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
      websiteVisible: true,
      AND: [
        ...(category ? [{ categorySlug: category }] : []),
        ...(level ? [{ levelSlugs: { has: level } }] : []),

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
                  sku: {
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
                {
                  author: {
                    contains: word,
                    mode: "insensitive" as const,
                  },
                },
                {
                  publisher: {
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
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">
            Shop Textbooks, Stationery & School Essentials
          </h1>

          <p className="mt-2 text-white/90">
            Browse NaCCA-approved textbooks, exam materials and school supplies.
            Fast delivery across Kasoa, Accra and Ghana.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://wa.me/233270030000"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Order Now via WhatsApp
            </a>

            <Link
              href="/school-list-items-kasoa"
              className="rounded-xl bg-green-500 px-5 py-2 font-semibold text-white"
            >
              View Full School List
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto mt-2 grid max-w-6xl grid-cols-1 gap-4 px-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 text-sm">
          <strong>NaCCA Approved</strong>
          <p className="text-gray-600">
            All textbooks follow Ghana&apos;s current curriculum.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 text-sm">
          <strong>Complete School Supplies</strong>
          <p className="text-gray-600">
            Everything in one place for students.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 text-sm">
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
            className="flex-1 rounded-xl border px-4 py-3"
          />

          {rawLevel && <input type="hidden" name="level" value={rawLevel} />}
          {rawCategory && (
            <input type="hidden" name="category" value={rawCategory} />
          )}

          <button className="rounded-xl bg-blue-900 px-6 py-3 font-bold text-white">
            Search
          </button>
        </form>

        {/* PRODUCTS */}
        <ShopClient products={products} />
      </section>
    </main>
  );
}