import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PRODUCTS_PER_PAGE = 24;

type Product = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc: string | null;
};

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

function prettifySlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;

  const pretty = prettifySlug(slug);

  const requestedPage = Number.parseInt(query?.page || "1", 10);
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 1
      ? requestedPage
      : 1;

  const baseTitle = `${pretty} Textbooks & Stationery | DeeGlobalGH`;

  const title =
    currentPage > 1
      ? `${pretty} Textbooks & Stationery - Page ${currentPage} | DeeGlobalGH`
      : baseTitle;

  const description = `Shop ${pretty} textbooks, stationery and school supplies from DeeGlobalGH in Kasoa, Ghana. Browse available learning materials and order for collection or delivery.`;

  const canonicalUrl =
    currentPage > 1
      ? `${SITE_URL}/level/${slug}?page=${currentPage}`
      : `${SITE_URL}/level/${slug}`;

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

export default async function LevelPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const query = await searchParams;

  const pretty = prettifySlug(slug);

  const requestedPage = Number.parseInt(query?.page || "1", 10);

  const safeRequestedPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  let products: Product[] = [];
  let totalProducts = 0;

  try {
    const where = {
      isActive: true,
      websiteVisible: true,
      levelSlugs: {
        has: slug,
      },
    };

    totalProducts = await prisma.product.count({
      where,
    });

    const totalPages = Math.max(
      1,
      Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
    );

    const currentPage = Math.min(safeRequestedPage, totalPages);

    products = await prisma.product.findMany({
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
      },
    });
  } catch (error) {
    console.error("Database error (level page):", error);
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
      ? `/level/${slug}?page=${page}`
      : `/level/${slug}`;
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">
        {pretty} Textbooks & School Supplies
      </h1>

      <p className="mb-3 text-gray-600">
        Browse textbooks, stationery and learning materials for {pretty} from
        DeeGlobalGH in Kasoa.
      </p>

      <p className="mb-6 text-gray-600">
        Product availability may vary, so you can check the current selection
        below or contact us if you have a specific school list or book
        requirement.
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="rounded-xl bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800"
        >
          Shop All Products
        </Link>

        <Link
          href="/school-list-items-kasoa"
          className="rounded-xl border px-4 py-2 font-semibold"
        >
          School List Shopping
        </Link>

        <Link
          href="/subjects"
          className="rounded-xl border px-4 py-2 font-semibold"
        >
          Browse by Subject
        </Link>

        <TrackedWhatsAppLink
          href={`https://wa.me/233246011773?text=${encodeURIComponent(
            `Hello DeeGlobalGH, I would like to enquire about textbooks and school supplies for ${pretty}. Please assist me.`
          )}`}
          linkLocation="level_page_hero"
          productName={pretty}
          className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400"
        >
          Order on WhatsApp
        </TrackedWhatsAppLink>
      </div>

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

      {products.length === 0 ? (
        <p className="text-gray-500">
          No active products found for this level.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="rounded-xl border p-3 transition hover:bg-gray-50"
            >
              <div className="relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-3">
                <Image
                  src={product.imageSrc || "/products/placeholder.webp"}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="h-full w-auto object-contain"
                />
              </div>

              <div className="text-sm font-semibold">{product.name}</div>

              <div className="mt-1 font-bold text-blue-900">
                GH₵ {product.retailPrice.toFixed(2)}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label={`${pretty} product pages`}
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
