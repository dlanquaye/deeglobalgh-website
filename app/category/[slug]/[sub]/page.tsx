import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategoryClient from "../CategoryClient";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PRODUCTS_PER_PAGE = 24;

function prettifySlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { slug, sub } = await params;
  const query = await searchParams;

  const prettyMain = prettifySlug(slug);
  const prettySub = prettifySlug(sub);

  const requestedPage = Number.parseInt(query?.page || "1", 10);
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 1
      ? requestedPage
      : 1;

  const baseTitle = `${prettySub} ${prettyMain} | DeeGlobalGH`;

  const title =
    currentPage > 1
      ? `${baseTitle.replace(" | DeeGlobalGH", "")} - Page ${currentPage} | DeeGlobalGH`
      : baseTitle;

  const description = `Shop ${prettySub} ${prettyMain} in Ghana. Order from DeeGlobalGH for fast delivery in Kasoa and beyond.`;

  const canonicalUrl =
    currentPage > 1
      ? `${SITE_URL}/category/${slug}/${sub}?page=${currentPage}`
      : `${SITE_URL}/category/${slug}/${sub}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug, sub } = await params;
  const query = await searchParams;

  const requestedPage = Number.parseInt(query?.page || "1", 10);

  const safeRequestedPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  let products: any[] = [];
  let totalProducts = 0;

  try {
    const where = {
      categorySlug: slug,
      subCategorySlug: sub,
      isActive: true,
      websiteVisible: true,
    };

    totalProducts = await prisma.product.count({
      where,
    });

    const totalPages = Math.max(
      1,
      Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
    );

    const currentPage = Math.min(safeRequestedPage, totalPages);

    const data = await prisma.product.findMany({
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
        retailPrice: true,
        imageSrc: true,
        stockQty: true,
        categorySlug: true,
      },
    });

    products = data || [];
  } catch (error) {
    console.error("Database error (nested category page):", error);
    products = [];
    totalProducts = 0;
  }

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  );

  const currentPage = Math.min(safeRequestedPage, totalPages);

  const firstProductNumber =
    totalProducts === 0
      ? 0
      : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

  const lastProductNumber = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    totalProducts
  );

  const buildPageHref = (page: number) => {
    return page > 1
      ? `/category/${slug}/${sub}?page=${page}`
      : `/category/${slug}/${sub}`;
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const prettyMain = prettifySlug(slug);
  const prettySub = prettifySlug(sub);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href={`/category/${slug}`}
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          &larr; Back to {prettyMain}
        </Link>
      </div>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-3 text-sm text-gray-500"
      >
        <Link href="/" className="hover:underline">
          Home
        </Link>

        <span aria-hidden="true"> / </span>

        <Link href={`/category/${slug}`} className="hover:underline">
          {prettyMain}
        </Link>

        <span aria-hidden="true"> / </span>

        <span className="font-medium text-gray-700" aria-current="page">
          {prettySub}
        </span>
      </nav>

      {/* Result summary */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
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
            "No products found"
          )}
        </p>

        {totalPages > 1 && (
          <p>
            Page{" "}
            <strong className="text-gray-900">{currentPage}</strong>{" "}
            of{" "}
            <strong className="text-gray-900">{totalPages}</strong>
          </p>
        )}
      </div>

      <CategoryClient slug={slug} products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label={`${prettySub} ${prettyMain} product pages`}
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
                  aria-current={isCurrent ? "page" : undefined}
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
    </main>
  );
}
