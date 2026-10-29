import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";

import ProductCard from "@/app/components/ProductCard";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PRODUCTS_PER_PAGE = 24;

export const dynamic = "force-dynamic";

type StoryBooksPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: StoryBooksPageProps): Promise<Metadata> {
  const params = await searchParams;

  const requestedPage = Number.parseInt(params?.page || "1", 10);

  const page =
    Number.isFinite(requestedPage) && requestedPage > 1
      ? requestedPage
      : 1;

  const canonical =
    page > 1
      ? `${SITE_URL}/story-books-in-kasoa?page=${page}`
      : `${SITE_URL}/story-books-in-kasoa`;

  const title =
    page > 1
      ? `Story Books, Novels, Prose & Drama Books in Kasoa - Page ${page} | DeeGlobalGH`
      : "Story Books, Novels, Prose & Drama Books in Kasoa | DeeGlobalGH";

  const description =
    "Shop story books, reading books, novels, prose, drama and literature books from DeeGlobalGH in Kasoa. Find African literature, Ghanaian literature, classics and popular school reading titles.";

  return {
    title,
    description,

    keywords: [
      "story books in Kasoa",
      "story books Ghana",
      "reading books in Kasoa",
      "reading books Ghana",
      "novels in Kasoa",
      "novels Ghana",
      "prose books Ghana",
      "drama books Ghana",
      "literature books Ghana",
      "African literature books Ghana",
      "Ghanaian literature books",
      "school story books Ghana",
      "literature books in Kasoa",
      "DeeGlobalGH story books",
    ],

    alternates: {
      canonical,
    },

    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "DeeGlobalGH",
    },
  };
}

export default async function StoryBooksInKasoaPage({
  searchParams,
}: StoryBooksPageProps) {
  const params = await searchParams;

  const requestedPage = Number.parseInt(params?.page || "1", 10);

  const safeRequestedPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    websiteVisible: true,
    categorySlug: "story-books",
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

    skip:
      (currentPage - 1) *
      PRODUCTS_PER_PAGE,

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
      : (currentPage - 1) *
          PRODUCTS_PER_PAGE +
        1;

  const lastProductNumber = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    totalProducts
  );

  const buildPageHref = (
    page: number
  ) => {
    if (page <= 1) {
      return "/story-books-in-kasoa";
    }

    return `/story-books-in-kasoa?page=${page}`;
  };

  const pageNumbers = Array.from(
    {
      length: totalPages,
    },
    (_, index) => index + 1
  );

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      "Story Books, Reading Books, Novels, Prose and Drama Books in Kasoa",
    url: `${SITE_URL}/story-books-in-kasoa`,
    description:
      "Browse story books, reading books, novels, prose, drama and literature books available from DeeGlobalGH in Kasoa, Ghana.",
    provider: {
      "@type": "Organization",
      name: "DeeGlobalGH",
      url: SITE_URL,
    },
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionJsonLd
          ).replace(/</g, "\\u003c"),
        }}
      />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-8">
        <div className="rounded-2xl bg-gradient-to-r from-amber-900 via-orange-800 to-amber-700 p-6 text-white shadow-lg md:p-9">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-100">
            DeeGlobalGH • Kasoa New Market
          </p>

          <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight md:text-4xl">
            Story Books, Reading Books,
            Novels, Prose &amp; Drama
            Books in Kasoa
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-amber-50">
            Browse story books and
            literature titles for students,
            young readers, parents, teachers
            and general readers. Our
            collection includes novels,
            prose, drama, classics, African
            literature, Ghanaian literature
            and popular reading books.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedWhatsAppLink
              href="https://wa.me/233246011773?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20enquire%20about%20story%20books%2C%20novels%20or%20literature%20books.%20Please%20assist%20me."
              linkLocation="story_books_page_hero"
              className="rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black"
            >
              Ask About a Book
            </TrackedWhatsAppLink>

            <Link
              href="/shop?category=story-books"
              className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 font-semibold text-white hover:bg-white/20"
            >
              Browse Story Books
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO SEO CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Story &amp; Reading Books
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Find engaging reading books
              for school, personal reading
              and literature study. Titles
              vary from classic stories to
              contemporary African and
              Ghanaian writing.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Novels &amp; Prose
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Explore novels and prose
              covering different themes,
              cultures, historical settings
              and human experiences from
              Ghana, Africa and beyond.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Drama &amp; Literature
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Shop plays and drama books by
              well-known Ghanaian, African
              and international writers for
              reading, discussion, literature
              study and examination
              preparation.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT COLLECTION */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Browse Our Story Book
            Collection
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            Availability changes as new
            titles arrive. If you are
            looking for a specific novel,
            prose book, drama book or
            reading title that you do not
            see here, send us the title or
            a photo of your school reading
            list on WhatsApp.
          </p>
        </div>

        {/* RESULT SUMMARY */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          <p>
            {totalProducts > 0 ? (
              <>
                Showing{" "}
                <strong className="text-gray-900">
                  {firstProductNumber}–
                  {lastProductNumber}
                </strong>{" "}
                of{" "}
                <strong className="text-gray-900">
                  {totalProducts}
                </strong>{" "}
                story books
              </>
            ) : (
              "No story books are currently visible online."
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

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <h3 className="font-bold text-gray-900">
              Looking for a particular
              story book?
            </h3>

            <p className="mt-2 text-gray-600">
              Send us the title or a photo
              of the book you need and our
              team will assist you.
            </p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <nav
            aria-label="Story book product pages"
            className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-6"
          >
            {currentPage > 1 ? (
              <Link
                href={buildPageHref(
                  currentPage - 1
                )}
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
              {pageNumbers.map(
                (pageNumber) => {
                  const isCurrent =
                    pageNumber ===
                    currentPage;

                  return (
                    <Link
                      key={pageNumber}
                      href={buildPageHref(
                        pageNumber
                      )}
                      aria-current={
                        isCurrent
                          ? "page"
                          : undefined
                      }
                      className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                        isCurrent
                          ? "border-amber-900 bg-amber-900 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  );
                }
              )}
            </div>

            {currentPage <
            totalPages ? (
              <Link
                href={buildPageHref(
                  currentPage + 1
                )}
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

      {/* LONG-FORM LOCAL SEO */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900">
              Where to Buy Story Books,
              Novels and Literature Books
              in Kasoa
            </h2>

            <p className="mt-4 leading-7 text-gray-700">
              DeeGlobalGH at Kasoa New
              Market supplies story books,
              reading books, novels, prose,
              drama and literature books
              for students, parents,
              teachers and general readers.
              Our catalogue includes both
              Ghanaian and international
              authors, with new titles
              added as stock becomes
              available.
            </p>

            <p className="mt-4 leading-7 text-gray-700">
              Parents and students often
              look for literature books by
              title or author rather than
              by school class. For that
              reason, our story book
              collection is organised
              around the books themselves
              instead of restricting every
              title to a particular class
              or level.
            </p>

            <p className="mt-4 leading-7 text-gray-700">
              Some titles may be used for
              school literature study,
              examination preparation or
              recommended reading, while
              others are suitable for
              general reading and personal
              enjoyment. Where a particular
              edition carries a verified
              recommendation or academic
              designation, that information
              is shown on the individual
              product page.
            </p>

            <h2 className="mt-8 text-xl font-bold text-gray-900">
              Ghanaian &amp; African
              Literature
            </h2>

            <p className="mt-3 leading-7 text-gray-700">
              Our growing literature
              collection includes works by
              Ghanaian and African writers
              as well as established
              international authors. This
              gives readers access to
              stories, drama and prose that
              explore African history,
              culture, relationships,
              society and everyday human
              experiences alongside global
              literary classics.
            </p>

            <h2 className="mt-8 text-xl font-bold text-gray-900">
              Looking for a Book That Is
              Not Listed?
            </h2>

            <p className="mt-3 leading-7 text-gray-700">
              Our online catalogue does
              not always represent every
              title that may be available.
              If you need a particular
              story book, novel, prose text
              or drama book, send us the
              book title, author or a photo
              of the cover and we will
              check availability for you.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedWhatsAppLink
                href="https://wa.me/233246011773?text=Hello%20DeeGlobalGH%2C%20I%20am%20looking%20for%20a%20story%20book%2C%20novel%2C%20prose%20or%20drama%20book.%20Please%20help%20me%20check%20availability."
                linkLocation="story_books_page_bottom"
                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
              >
                Check a Book on WhatsApp
              </TrackedWhatsAppLink>

              <Link
                href="/shop"
                className="rounded-xl border px-5 py-3 font-semibold text-gray-800"
              >
                Browse Full Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageJumpNav />
    </main>
  );
}
