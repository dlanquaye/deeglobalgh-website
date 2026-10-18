import type { Metadata } from "next";
import Link from "next/link";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";
import { prisma } from "@/lib/prisma";
import CategoryClient from "./CategoryClient";

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
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;

  const pretty = prettifySlug(slug);

  const requestedPage = Number.parseInt(query?.page || "1", 10);
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 1
      ? requestedPage
      : 1;

  const baseTitle =
    slug === "textbooks"
      ? "NaCCA-Approved & GES-Recommended Textbooks | DeeGlobalGH"
      : `${pretty} | DeeGlobalGH`;

  const title =
    currentPage > 1
      ? `${baseTitle.replace(" | DeeGlobalGH", "")} - Page ${currentPage} | DeeGlobalGH`
      : baseTitle;

  let description = `Shop ${pretty} in Ghana. Order from DeeGlobalGH for fast delivery in Kasoa and beyond.`;

  if (slug === "textbooks") {
    description =
      "Shop a large selection of NaCCA-approved and GES-recommended textbooks for KG, Primary, JHS and SHS, including Standards-Based Curriculum (SBC), Common Core Programme (CCP) and Secondary Education Curriculum books from DeeGlobalGH in Kasoa.";
  }

  if (slug === "story-books") {
    description =
      "Buy story books for kids and students in Ghana. Shop African story books, literature books, and reading books with fast delivery from DeeGlobalGH.";
  }

  const canonicalUrl =
    currentPage > 1
      ? `${SITE_URL}/category/${slug}?page=${currentPage}`
      : `${SITE_URL}/category/${slug}`;

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
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
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
        sku: true,
        categorySlug: true,
      },
    });

    products = data || [];
  } catch (error) {
    console.error("Database error (category page):", error);
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
      ? `/category/${slug}?page=${page}`
      : `/category/${slug}`;
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
            {slug.replace(/-/g, " ").toUpperCase()} in Kasoa
          </h1>

          <p className="mt-2 max-w-2xl text-white/90">
            {slug === "textbooks"
              ? "Shop a large selection of NaCCA-approved and GES-recommended textbooks for KG, Primary, JHS and SHS, including books for Ghana's Standards-Based Curriculum (SBC), Common Core Programme (CCP) and Secondary Education Curriculum. Collection and delivery options are available."
              : `Shop ${prettifySlug(slug)} and school essentials from DeeGlobalGH in Kasoa. Fast delivery across Ghana.`}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-xl bg-white px-5 py-2 font-semibold text-blue-900"
            >
              Shop All
            </Link>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                `Hello DeeGlobalGH, I would like to enquire about ${prettifySlug(slug)}. Please assist me.`
              )}`}
              linkLocation="category_page_hero"
              productName={slug}
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Order Now via WhatsApp
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        {/* TEXTBOOK NAV */}
        {slug === "textbooks" && (
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-semibold">Shop by Level</h2>

            <div className="mb-5 flex flex-wrap gap-3">
              <Link
                href="/subjects"
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Browse by Subject
              </Link>

              <Link
                href="/series"
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Browse Textbook Series
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <a
                href="/category/textbooks/pre-school"
                className="group rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-100 to-pink-50 p-5 transition hover:shadow-md"
              >
                <p className="font-semibold group-hover:text-pink-700">
                  Pre-School
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Foundation learning books
                </p>
              </a>

              <a
                href="/category/textbooks/basic-1-3"
                className="group rounded-2xl border border-green-200 bg-gradient-to-r from-green-100 to-green-50 p-5 transition hover:shadow-md"
              >
                <p className="font-semibold group-hover:text-green-700">
                  Basic 1–3
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Early learning essentials
                </p>
              </a>

              <a
                href="/category/textbooks/basic-4-6"
                className="group rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-100 to-blue-50 p-5 transition hover:shadow-md"
              >
                <p className="font-semibold group-hover:text-blue-700">
                  Basic 4–6
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Upper primary textbooks
                </p>
              </a>

              <a
                href="/category/exam-materials/jhs"
                className="group rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-100 to-yellow-50 p-5 transition hover:shadow-md"
              >
                <p className="font-semibold group-hover:text-yellow-700">
                  JHS
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  BECE preparation
                </p>
              </a>

              <a
                href="/category/textbooks/jhs-combined"
                className="group rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-100 to-indigo-50 p-5 transition hover:shadow-md"
              >
                <p className="font-semibold group-hover:text-indigo-700">
                  JHS Combined
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Basic 7–9 combined
                </p>
              </a>

              <a
                href="/category/textbooks/shs"
                className="group rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-100 to-purple-50 p-5 transition hover:shadow-md"
              >
                <p className="font-semibold group-hover:text-purple-700">
                  SHS
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  SHS split levels
                </p>
              </a>

              <a
                href="/category/textbooks/shs-combined"
                className="group rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-100 to-indigo-50 p-5 transition hover:shadow-md"
              >
                <p className="font-semibold group-hover:text-indigo-700">
                  SHS Combined
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  SHS 1–3 combined
                </p>
              </a>

              <a
                href="/category/exam-materials/shs"
                className="group rounded-2xl border border-green-200 bg-gradient-to-r from-green-100 to-green-50 p-5 transition hover:shadow-md"
              >
                <p className="font-semibold group-hover:text-green-700">
                  SHS (WASSCE)
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Exam preparation
                </p>
              </a>
            </div>
          </div>
        )}

        {/* EXAM NAV */}
        {slug === "exam-materials" && (
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-semibold">
              Select Exam Level
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <a
                href="/category/exam-materials/jhs"
                className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center transition hover:bg-yellow-100"
              >
                JHS (BECE)
              </a>

              <a
                href="/category/exam-materials/shs"
                className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-center transition hover:bg-cyan-100"
              >
                SHS (WASSCE)
              </a>
            </div>
          </div>
        )}

        {/* RESULT SUMMARY */}
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

        {/* PRODUCTS */}
        <CategoryClient slug={slug} products={products} />

        {/* PAGINATION */}
        {totalPages > 1 && (
          <nav
            aria-label={`${prettifySlug(slug)} product pages`}
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
      </section>

      {/* TRUST */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-10 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">
            {slug === "textbooks"
              ? "NaCCA-Approved & GES-Recommended Textbooks"
              : "School Essentials"}
          </h3>
          <p className="text-sm text-gray-600">
            {slug === "textbooks"
              ? "Browse textbooks for Ghanaian schools by level, subject and textbook series, including SBC, CCP and Secondary Education Curriculum titles."
              : "Practical school supplies for students, parents and schools."}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">Complete School Supplies</h3>
          <p className="text-sm text-gray-600">Everything in one place.</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold">Fast Delivery</h3>
          <p className="text-sm text-gray-600">
            Reliable delivery across Ghana.
          </p>
        </div>
      </section>

      <PageJumpNav />
    </main>
  );
}