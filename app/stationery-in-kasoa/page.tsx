import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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

const stationeryBrands = [
  "Nataraj",
  "BIC",
  "Deli",
  "DOMS",
  "Camlin",
  "Casio",
  "Camel",
  "Monami",
  "Obama",
  "Lucky",
  "Simba",
  "Jinxing",
  "Cox",
  "Super Marshal",
  "Marshal",
];

const popularStationeryGroups = [
  {
    title: "Pens, Pencils & Writing Materials",
    description:
      "School pens, pencils, graded pencils, correction pens and other everyday writing materials. Brands in our changing range include BIC, Nataraj, Deli, DOMS, Obama, Lucky and Simba.",
  },
  {
    title: "Erasers & Sharpeners",
    description:
      "Erasers and sharpeners for school and everyday writing, including options from Nataraj and DOMS, subject to current availability.",
  },
  {
    title: "Mathematical Sets & Geometry Tools",
    description:
      "Maths sets and geometry tools for Basic, JHS and SHS students. Our range may include Camlin, Nataraj, Cox, Super Marshal and Marshal.",
  },
  {
    title: "Calculators",
    description:
      "Deli and Casio calculators for students and everyday school use. Available models may change, so customers can enquire before visiting.",
  },
  {
    title: "Exercise Books & Writing Books",
    description:
      "Note 1 exercise books in 40 leaves and 60 leaves, various sizes of Note 3 books, foolscap books, writing books, red and blue line books and related school notebooks.",
  },
  {
    title: "Markers & Classroom Writing Supplies",
    description:
      "Whiteboard markers and related classroom writing supplies, including Deli and Monami options. Customers also regularly ask us for board markers and dusters.",
  },
  {
    title: "Files, Clear Bags & File Pouches",
    description:
      "Flat files, clear bags, file pouches and other document-storage items for students, teachers and offices.",
  },
  {
    title: "Art & Visual Arts Supplies",
    description:
      "Crayons, colour pencils, poster colours, paint brushes, sketch books, sketch pads, canvas, graded pencils, calligraphy pens, electric erasers, art charcoal powder, acrylic paints, manilla cards and other visual arts tools.",
  },
];

const teacherAndOfficeSupplies = [
  "Attendance registers",
  "SBA materials",
  "Attendance books",
  "Cash books",
  "Facilitator lesson planners",
  "A4 paper",
  "A3 paper",
  "Staplers",
  "Staple pins",
  "Cello tape",
  "Masking tape",
  "Neon tape",
];

const popularSearchItems = [
  "A1 books",
  "Writing books",
  "Red and blue line books",
  "Board markers",
  "Dusters",
  "Official paper",
  "Mathematical sets",
  "Scientific calculators",
  "Exercise books",
  "A4 paper",
];

const nearbyAreas = [
  "Kasoa",
  "Nyanyano",
  "Opeikuma",
  "Opeikuma Mawuli",
  "Ofankor",
  "Buduburam",
  "Millennium City",
  "Amanfrom",
  "Awutu Breku",
  "SCC",
  "Bortianor",
  "Ayigbe Town",
];

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
    "Stationery & School Supplies in Kasoa | DeeGlobalGH";

  const title =
    !hasFilters && currentPage > 1
      ? `Stationery & School Supplies in Kasoa - Page ${currentPage} | DeeGlobalGH`
      : baseTitle;

  const description =
    "Buy stationery and school supplies in Kasoa including pens, pencils, maths sets, calculators, exercise books, art supplies, teacher supplies, files, markers and more from DeeGlobalGH.";

  const canonicalUrl =
    !hasFilters && currentPage > 1
      ? `${SITE_URL}/stationery-in-kasoa?page=${currentPage}`
      : `${SITE_URL}/stationery-in-kasoa`;

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

export default async function StationeryKasoaPage({
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
        : {
            OR: [
              {
                categorySlug: "stationery",
              },
              {
                categorySlug: "school-essentials",
                subCategorySlug: {
                  in: [
                    "a4-paper",
                    "crayons",
                    "exercise-books",
                    "pencils",
                    "pens",
                    "rulers",
                  ],
                },
              },
            ],
          },

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
      ? `/stationery-in-kasoa?${queryString}`
      : "/stationery-in-kasoa";
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* ================= SEO HEADER ================= */}
      <h1 className="mb-4 text-3xl font-bold text-blue-900">
        Stationery &amp; School Supplies in Kasoa
      </h1>

      <p className="mb-4 max-w-3xl text-gray-600">
        Looking for stationery or school supplies in Kasoa? DeeGlobalGH serves
        parents, students, teachers, schools, offices and selected bulk buyers
        from our shop at Kasoa New Market.
      </p>

      <p className="mb-6 max-w-3xl text-gray-600">
        Our changing range includes pens, pencils, exercise books, mathematical
        sets, calculators, markers, art materials, teacher supplies, files,
        paper and other practical school and office items. Availability varies
        by product, brand and model.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/textbooks-in-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Shop Textbooks in Kasoa
        </Link>

        <Link
          href="/exam-materials-in-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Exam Materials &amp; Past Questions
        </Link>

        <Link
          href="/school-list-items-kasoa"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          School List Shopping
        </Link>

        <Link
          href="/locations/kasoa-new-market"
          className="rounded-xl border px-4 py-2 hover:bg-gray-100"
        >
          Visit Our Kasoa New Market Shop
        </Link>
      </div>

      {/* CTA */}
      <div className="mb-10 flex flex-wrap gap-3">
        <Link
          href="/shop?category=stationery"
          className="rounded-xl bg-blue-900 px-6 py-3 font-bold text-white"
        >
          Shop Available Stationery
        </Link>

        <TrackedWhatsAppLink
          href="https://wa.me/233246011773?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20enquire%20about%20stationery%20and%20school%20supplies.%20Please%20assist%20me."
          linkLocation="stationery_in_kasoa"
          className="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black"
        >
          Ask About Stationery on WhatsApp
        </TrackedWhatsAppLink>
      </div>

      {/* ================= DISCOVERY ================= */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-bold text-blue-900">
          Popular Stationery &amp; School Supplies
        </h2>

        <p className="mb-6 max-w-3xl text-gray-600">
          Customers shop with us for everyday classroom supplies, school-list
          items and specialist stationery. The examples below represent part
          of our wider range and do not mean every item is available at all
          times.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {popularStationeryGroups.map((group) => (
            <div
              key={group.title}
              className="rounded-xl border p-5"
            >
              <h3 className="mb-2 text-lg font-bold">
                {group.title}
              </h3>

              <p className="text-sm leading-6 text-gray-600">
                {group.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BRANDS ================= */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-bold text-blue-900">
          Stationery Brands Available in Our Range
        </h2>

        <p className="mb-5 max-w-3xl text-gray-600">
          Depending on current stock, customers may find stationery from
          recognised brands and product ranges such as:
        </p>

        <div className="flex flex-wrap gap-2">
          {stationeryBrands.map((brand) => (
            <span
              key={brand}
              className="rounded-full border bg-gray-50 px-4 py-2 text-sm"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* ================= CUSTOMER LANGUAGE ================= */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-bold text-blue-900">
          Common School Supplies Customers Ask for
        </h2>

        <p className="mb-5 max-w-3xl text-gray-600">
          Not everyone searches using a brand or formal product name. Customers
          also ask for familiar school items such as:
        </p>

        <div className="flex flex-wrap gap-2">
          {popularSearchItems.map((item) => (
            <span
              key={item}
              className="rounded-full border px-4 py-2 text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ================= ART SUPPLIES ================= */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-bold text-blue-900">
          Art &amp; Visual Arts Supplies in Kasoa
        </h2>

        <p className="mb-4 max-w-3xl text-gray-600">
          Our art-supply range may include Camel crayons, Nataraj crayons,
          Nataraj colour pencils, poster colours, paint brushes, sketch books,
          sketch pads, canvas, graded pencils, calligraphy pens, electric
          erasers, art charcoal powder, acrylic paints, manilla cards and other
          visual arts tools.
        </p>

        <p className="max-w-3xl text-gray-600">
          Art materials change frequently, so customers looking for a
          particular colour, size or type can contact us before visiting.
        </p>
      </section>

      {/* ================= TEACHERS / OFFICE ================= */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-bold text-blue-900">
          Teacher, School &amp; Office Supplies
        </h2>

        <p className="mb-5 max-w-3xl text-gray-600">
          DeeGlobalGH also supplies practical materials used by teachers,
          facilitators, schools and offices.
        </p>

        <div className="grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-3">
          {teacherAndOfficeSupplies.map((item) => (
            <div
              key={item}
              className="rounded-lg border px-4 py-3 text-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHOLESALE ================= */}
      <section className="mb-12 rounded-xl border bg-gray-50 p-6">
        <h2 className="mb-3 text-xl font-bold text-blue-900">
          Bulk &amp; Wholesale Stationery Enquiries
        </h2>

        <p className="mb-4 max-w-3xl text-gray-600">
          Selected stationery and school-supply items may be available in
          quantity for schools, teachers, offices, resellers and other bulk
          buyers. Wholesale or bulk availability depends on the particular
          product and current stock.
        </p>

        <TrackedWhatsAppLink
          href="https://wa.me/233246011773?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20enquire%20about%20bulk%20or%20wholesale%20stationery.%20Please%20assist%20me."
          linkLocation="stationery_bulk_enquiry"
          className="inline-block rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black"
        >
          Ask About Bulk Stationery
        </TrackedWhatsAppLink>
      </section>

      {/* ================= SEARCH ================= */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">
          Search Available Stationery
        </h2>

        <form method="GET" className="mb-6 flex gap-3">
          <input
            type="text"
            name="search"
            defaultValue={rawSearch}
            placeholder="Search pens, pencils, calculators, markers..."
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
                href={`/stationery-in-kasoa?${query.toString()}`}
                className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100"
              >
                {lvl.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-bold">
          Available Stationery With Product Images
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
            No matching stationery found.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            The item may still be available in our wider shop range. Try
            another keyword or ask us on WhatsApp.
          </p>

          <Link
            href="/shop?category=stationery"
            className="mt-4 inline-block rounded-xl bg-blue-900 px-6 py-3 font-bold text-white"
          >
            View Available Stationery
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
          aria-label="Stationery in Kasoa product pages"
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

      {/* ================= LOCAL SEO ================= */}
      <section className="mt-12 max-w-4xl">
        <h2 className="mb-3 text-2xl font-bold text-blue-900">
          Buy Stationery Near Kasoa New Market
        </h2>

        <p className="mb-4 text-gray-600">
          DeeGlobalGH is located inside Kasoa New Market. Customers can shop
          for school stationery, classroom supplies, art materials and
          selected office supplies, then choose collection or available
          delivery options.
        </p>

        <p className="mb-5 text-gray-600">
          We also serve customers from Kasoa and surrounding areas including{" "}
          {nearbyAreas.slice(1).join(", ")}. Delivery availability depends on
          destination, order size and current arrangements.
        </p>

        <Link
          href="/locations/kasoa-new-market"
          className="inline-block rounded-xl border px-5 py-3 font-semibold hover:bg-gray-100"
        >
          Kasoa New Market Location &amp; Directions
        </Link>
      </section>

      <PageJumpNav />
    </div>
  );
}
