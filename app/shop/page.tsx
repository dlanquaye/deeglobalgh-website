import Link from "next/link";
import { Prisma } from "@prisma/client";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import { prisma } from "@/lib/prisma";
import ShopClient from "./ShopClient";
import PageJumpNav from "@/app/components/PageJumpNav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop Textbooks, Stationery & School Essentials | DeeGlobalGH",
  description:
    "Shop textbooks, stationery, exam materials and school essentials from DeeGlobalGH in Kasoa, Ghana.",
  alternates: {
    canonical: "https://www.shopdeeglobalgh.com/shop",
  },
};

const PRODUCTS_PER_PAGE = 24;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    level?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const rawSearch = params?.search || "";
  const rawLevel = params?.level || "";
  const rawCategory = params?.category || "";
  const rawPage = params?.page || "1";

  const search = rawSearch.toLowerCase().trim();
  const keywords = search.split(" ").filter(Boolean);
  const level = rawLevel.toLowerCase().trim();
  const category = rawCategory.toLowerCase().trim();

  const requestedPage = Number.parseInt(rawPage, 10);
  const safeRequestedPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const where: Prisma.ProductWhereInput = {
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
  };

  const totalProducts = await prisma.product.count({
    where,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  );

  const currentPage = Math.min(safeRequestedPage, totalPages);

  const products = await prisma.product.findMany({
    where,
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    skip: (currentPage - 1) * PRODUCTS_PER_PAGE,
    take: PRODUCTS_PER_PAGE,
  });

  const firstProductNumber =
    totalProducts === 0
      ? 0
      : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

  const lastProductNumber = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    totalProducts
  );

  const buildPageHref = (page: number) => {
    const query = new URLSearchParams();

    if (rawSearch) {
      query.set("search", rawSearch);
    }

    if (rawLevel) {
      query.set("level", rawLevel);
    }

    if (rawCategory) {
      query.set("category", rawCategory);
    }

    if (page > 1) {
      query.set("page", String(page));
    }

    const queryString = query.toString();

    return queryString ? `/shop?${queryString}` : "/shop";
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">
            Shop Textbooks, Stationery & School Essentials
          </h1>

          <p className="mt-2 text-white/90">
            Browse NaCCA-approved textbooks, exam materials and school
            supplies. Fast delivery across Kasoa, Accra and Ghana.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <TrackedWhatsAppLink
              href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20enquire%20about%20school%20supplies%20from%20your%20online%20shop.%20Please%20assist%20me."
              linkLocation="shop_page_hero"
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Order Now via WhatsApp
            </TrackedWhatsAppLink>

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
          <strong>
            NaCCA-Approved &amp; Curriculum-Aligned Textbooks
          </strong>

          <p className="text-gray-600">
            Shop SBC textbooks for KG and Primary, CCP textbooks for JHS,
            and books for the new Secondary Education Curriculum.
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

          {rawLevel && (
            <input
              type="hidden"
              name="level"
              value={rawLevel}
            />
          )}

          {rawCategory && (
            <input
              type="hidden"
              name="category"
              value={rawCategory}
            />
          )}

          <button className="rounded-xl bg-blue-900 px-6 py-3 font-bold text-white">
            Search
          </button>
        </form>

        {/* RESULT SUMMARY */}
        <div
          id="shop-results"
          className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600"
        >
          <p>
            {totalProducts > 0 ? (
              <>
                Showing{" "}
                <strong className="text-gray-900">
                  {firstProductNumber}–{lastProductNumber}
                </strong>{" "}
                of{" "}
                <strong className="text-gray-900">
                  {totalProducts}
                </strong>{" "}
                products
              </>
            ) : (
              "No matching products"
            )}
          </p>

          {totalPages > 1 && (
            <p>
              Page{" "}
              <strong className="text-gray-900">
                {currentPage}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-900">
                {totalPages}
              </strong>
            </p>
          )}
        </div>

        {/* PRODUCTS */}
        <ShopClient products={products} />

        {/* PAGINATION */}
        {totalPages > 1 && (
          <nav
            aria-label="Shop product pages"
            className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-6"
          >
            {currentPage > 1 ? (
              <Link
                href={buildPageHref(currentPage - 1)}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                ← Previous
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400"
              >
                ← Previous
              </span>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              {pageNumbers.map((pageNumber) => {
                const isCurrent = pageNumber === currentPage;

                return (
                  <Link
                    key={pageNumber}
                    href={buildPageHref(pageNumber)}
                    aria-current={
                      isCurrent ? "page" : undefined
                    }
                    className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                      isCurrent
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                );
              })}
            </div>

            {currentPage < totalPages ? (
              <Link
                href={buildPageHref(currentPage + 1)}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Next →
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400"
              >
                Next →
              </span>
            )}
          </nav>
        )}
      </section>
            <PageJumpNav />

    </main>
  );
}