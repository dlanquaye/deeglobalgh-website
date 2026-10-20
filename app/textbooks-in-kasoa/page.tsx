import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/app/components/ProductCard";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PRODUCTS_PER_PAGE = 24;

type PageSearchParams = {
  search?: string;
  level?: string;
  category?: string;
  page?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;

  const rawSearch = params?.search || "";
  const rawLevel = params?.level || "";
  const rawCategory = params?.category || "";

  const requestedPage = Number.parseInt(params?.page || "1", 10);
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 1
      ? requestedPage
      : 1;

  const hasFilters =
    rawSearch.trim().length > 0 ||
    rawLevel.trim().length > 0 ||
    rawCategory.trim().length > 0;

  const baseTitle =
    "Textbooks in Kasoa | Buy School Books in Kasoa - DeeGlobalGH";

  const title =
    !hasFilters && currentPage > 1
      ? `Textbooks in Kasoa - Page ${currentPage} | DeeGlobalGH`
      : baseTitle;

  const description =
    "Buy a large selection of NaCCA-approved and GES-recommended textbooks in Kasoa for Pre-School, Basic, JHS and SHS, including SBC, CCP and Secondary Education Curriculum books.";

  const canonicalUrl =
    !hasFilters && currentPage > 1
      ? `${SITE_URL}/textbooks-in-kasoa?page=${currentPage}`
      : `${SITE_URL}/textbooks-in-kasoa`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: hasFilters
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
  };
}

export default async function TextbooksKasoaPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;

  /* -------------------------------------------
     PARAMS
  ------------------------------------------- */
  const rawSearch = params?.search || "";
  const rawLevel = params?.level || "";
  const rawCategory = params?.category || "";
  const rawPage = params?.page || "1";

  /* -------------------------------------------
     NORMALIZE
  ------------------------------------------- */
  const search = rawSearch.toLowerCase().trim();
  const level = rawLevel.toLowerCase().trim();
  const category = rawCategory.toLowerCase().trim();

  const keywords = search.split(" ").filter(Boolean);

  const requestedPage = Number.parseInt(rawPage, 10);

  const safeRequestedPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  /* -------------------------------------------
     QUERY BUILD
  ------------------------------------------- */
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    websiteVisible: true,
    AND: [
      category
        ? { categorySlug: category }
        : { categorySlug: "textbooks" },

      ...(level
        ? [
            {
              levelSlugs: {
                has: level,
              },
            },
          ]
        : []),

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
              {
                tags: {
                  has: word,
                },
              },
            ],
          }))
        : []),
    ],
  };

  /* -------------------------------------------
     COUNT + PAGINATED FETCH
  ------------------------------------------- */
  const totalProducts = await prisma.product.count({
    where,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  );

  const currentPage = Math.min(
    safeRequestedPage,
    totalPages
  );

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
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      retailPrice: true,
      imageSrc: true,
      stockQty: true,
    },
  });

  const firstProductNumber =
    totalProducts === 0
      ? 0
      : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

  const lastProductNumber = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    totalProducts
  );

  /* -------------------------------------------
     PAGINATION URL BUILDER
  ------------------------------------------- */
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

    return queryString
      ? `/textbooks-in-kasoa?${queryString}`
      : "/textbooks-in-kasoa";
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  /* -------------------------------------------
     UI
  ------------------------------------------- */
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* ================= SEO HEADER ================= */}
      <h1 className="mb-4 text-3xl font-bold text-blue-900">
        Textbooks in Kasoa – Buy School Books Near You
      </h1>

      <p className="mb-4 max-w-2xl text-gray-600">
        Looking for textbooks in Kasoa? DeeGlobalGH stocks a large selection
        of NaCCA-approved and GES-recommended textbooks for Pre-School,
        Basic 1–6, JHS, and SHS students. These include books for Ghana&apos;s
        Standards-Based Curriculum (SBC), Common Core Programme (CCP) and
        Secondary Education Curriculum. Order online and choose collection or
        delivery in Kasoa.
      </p>

      <p className="mb-6 max-w-2xl text-gray-600">
        Browse school books by level, subject and textbook series, together
        with exam materials and learning resources to help students succeed.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/stationery-in-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Shop Stationery in Kasoa
        </Link>

        <Link
          href="/exam-materials-in-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Buy Exam Materials in Kasoa
        </Link>

        <Link
          href="/subjects"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Browse Textbooks by Subject
        </Link>

        <Link
          href="/jhs-textbooks-in-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          JHS Books &amp; Textbooks
        </Link>

        <Link
          href="/shs-textbooks-in-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          SHS Books &amp; Textbooks
        </Link>

        <Link
          href="/series"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Browse Textbook Series
        </Link>
      </div>

      {/* CTA */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/shop?category=textbooks"
          className="rounded-xl bg-blue-900 px-6 py-3 font-bold text-white"
        >
          Shop All Textbooks
        </Link>

        <TrackedWhatsAppLink
          href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20enquire%20about%20textbooks.%20Please%20assist%20me."
          linkLocation="textbooks_in_kasoa"
          className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black"
        >
          Order on WhatsApp
        </TrackedWhatsAppLink>
      </div>

      {/* ================= SEARCH ================= */}
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
          const query = new URLSearchParams();

          if (rawSearch) {
            query.set("search", rawSearch);
          }

          if (rawCategory) {
            query.set("category", rawCategory);
          }

          query.set("level", lvl);

          return (
            <Link
              key={lvl}
              href={`/textbooks-in-kasoa?${query.toString()}`}
              className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100"
            >
              {lvl.toUpperCase()}
            </Link>
          );
        })}
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">
          Available Textbooks
        </h2>

        <div className="text-sm text-gray-600">
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
        </div>
      </div>

      {totalPages > 1 && (
        <p className="mb-6 text-sm text-gray-600">
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

      {products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-gray-700">
            No textbooks found.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Try different keywords or browse all textbooks.
          </p>

          <Link
            href="/shop?category=textbooks"
            className="mt-4 inline-block rounded-xl bg-blue-900 px-6 py-3 font-bold text-white"
          >
            View All Textbooks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <nav
          aria-label="Textbooks in Kasoa product pages"
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
              const isCurrent =
                pageNumber === currentPage;

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

      {/* ================= SEO FOOTER ================= */}
      <div className="mt-12 max-w-3xl">
        <h2 className="mb-3 text-xl font-bold">
          Where to buy textbooks in Kasoa
        </h2>

        <p className="mb-3 text-gray-600">
          Parents and students in Kasoa can easily order textbooks online from
          DeeGlobalGH. We offer collection and delivery options, with
          NaCCA-approved and GES-recommended textbooks for different school
          levels.
        </p>

        <p className="text-gray-600">
          Whether you need Standards-Based Curriculum books, Common Core
          Programme textbooks, JHS materials, or SHS books, you can browse the
          available selection and order for collection or delivery.
        </p>
      </div>

      <PageJumpNav />
    </div>
  );
}
