import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/app/components/ProductCard";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PRODUCTS_PER_PAGE = 24;

type PageSearchParams = {
  page?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;

  const requestedPage = Number.parseInt(params?.page || "1", 10);

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 1
      ? requestedPage
      : 1;

  const baseTitle =
    "Exam Materials in Kasoa | BECE & WASSCE Supplies | DeeGlobalGH";

  const title =
    currentPage > 1
      ? `Exam Materials in Kasoa - Page ${currentPage} | DeeGlobalGH`
      : baseTitle;

  const description =
    "Buy exam materials in Kasoa including maths sets, scientific calculators, past questions, and exam essentials for BECE and WASSCE.";

  const canonicalUrl =
    currentPage > 1
      ? `${SITE_URL}/exam-materials-in-kasoa?page=${currentPage}`
      : `${SITE_URL}/exam-materials-in-kasoa`;

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
  };
}

export default async function ExamMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;

  const requestedPage = Number.parseInt(
    params?.page || "1",
    10
  );

  const safeRequestedPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const where = {
    isActive: true,
    websiteVisible: true,
    categorySlug: "exam-materials",
  };

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

  const buildPageHref = (page: number) => {
    return page > 1
      ? `/exam-materials-in-kasoa?page=${page}`
      : "/exam-materials-in-kasoa";
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* TITLE */}
      <h1 className="mb-2 text-2xl font-bold">
        Buy Exam Materials in Kasoa
      </h1>

      <p className="mb-6 text-gray-600">
        Shop exam essentials for BECE and WASSCE including calculators,
        maths sets, past questions, and answer sheets.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/textbooks-in-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Shop Textbooks in Kasoa
        </Link>

        <Link
          href="/stationery-in-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Shop Stationery in Kasoa
        </Link>

        <Link
          href="/school-list-items-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          School List Shopping
        </Link>

        <Link
          href="/kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          School Supplies in Kasoa
        </Link>
      </div>

      {/* CTA */}
      <div className="mb-6 flex flex-wrap gap-3">
        <TrackedWhatsAppLink
          href={`https://wa.me/233246011773?text=${encodeURIComponent(
            "Hello DeeGlobalGH, I would like to enquire about exam materials, revision books and past questions. Please assist me."
          )}`}
          linkLocation="exam_materials_in_kasoa"
          className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black"
        >
          Order on WhatsApp
        </TrackedWhatsAppLink>
      </div>

      {/* RESULT SUMMARY */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
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
            "No exam materials available"
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
      {products.length === 0 ? (
        <p>No exam materials available yet.</p>
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <nav
          aria-label="Exam materials product pages"
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
    </div>
  );
}
