import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import TrackedLink from "@/app/components/TrackedLink";
import TrackedProductLink from "@/app/components/TrackedProductLink";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";
import { prisma } from "@/lib/prisma";
import { getPublicSeries, PUBLIC_SERIES } from "@/lib/series";

const SITE_URL = "https://www.shopdeeglobalgh.com";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type SeriesProduct = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc: string | null;
  stockQty: number;
  levelSlugs: string[];
};

type ExcellenceStage = {
  id: string;
  heading: string;
  description: string;
  products: SeriesProduct[];
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getPublicSeries(slug);

  if (!series) {
    return {
      title: "Series Not Found | DeeGlobalGH",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = `${SITE_URL}/series/${series.slug}`;

  return {
    title: series.title,
    description: series.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: series.title,
      description: series.description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
      title: series.title,
      description: series.description,
    },
  };
}

function isPreSchoolProduct(product: SeriesProduct) {
  return product.levelSlugs.some((level) =>
    [
      "creche",
      "nursery",
      "nursery-1",
      "nursery-2",
      "kg",
      "kg-1",
      "kg-2",
      "pre-school",
      "preschool",
    ].includes(level)
  );
}

function isBasicProduct(product: SeriesProduct) {
  return product.levelSlugs.some(
    (level) =>
      level === "basic" ||
      /^basic-[1-6]$/.test(level)
  );
}

function isJhsProduct(product: SeriesProduct) {
  return product.levelSlugs.some(
    (level) => level === "jhs" || /^jhs-[1-3]$/.test(level)
  );
}

function isShsProduct(product: SeriesProduct) {
  return product.levelSlugs.some(
    (level) => level === "shs" || /^shs-[1-3]$/.test(level)
  );
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const series = getPublicSeries(slug);

  if (!series) {
    notFound();
  }

  let products: SeriesProduct[] = [];

  try {
    products = await prisma.product.findMany({
      where: {
        brand: series.brand,
        isActive: true,
        websiteVisible: true,
      },
      orderBy: [
        {
          name: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        retailPrice: true,
        imageSrc: true,
        stockQty: true,
        levelSlugs: true,
      },
    });
  } catch (error) {
    console.error(`Database error (${series.name} page):`, error);
    products = [];
  }

  const itemListId = `series_${series.slug.replace(/-/g, "_")}`;

  const whatsappMessage = `Hello DeeGlobalGH, I would like to enquire about ${series.name} textbooks and learning materials. Please assist me.`;

  const isExcellence = series.slug === "excellence";

  const excellenceStages: ExcellenceStage[] = isExcellence
    ? [
        {
          id: "pre-school",
          heading: "Excellence Pre-School Books",
          description:
            "Browse available Excellence learning materials for Creche, Nursery and KG.",
          products: products.filter(isPreSchoolProduct),
        },
        {
          id: "basic",
          heading: "Excellence Basic 1–6 Textbooks",
          description:
            "Browse available Excellence textbooks and learning materials for Basic 1 through Basic 6.",
          products: products.filter(isBasicProduct),
        },
        {
          id: "jhs",
          heading: "Excellence JHS Textbooks",
          description:
            "Browse available Excellence textbooks and learning materials for Junior High School.",
          products: products.filter(isJhsProduct),
        },
        {
          id: "shs",
          heading: "Excellence SHS Textbooks",
          description:
            "Browse available Excellence textbooks for Senior High School students in Ghana.",
          products: products.filter(isShsProduct),
        },
      ]
    : [];

  const groupedExcellenceIds = new Set(
    excellenceStages.flatMap((stage) =>
      stage.products.map((product) => product.id)
    )
  );

  const ungroupedExcellenceProducts = isExcellence
    ? products.filter((product) => !groupedExcellenceIds.has(product.id))
    : [];

  const renderProductCard = (
    product: SeriesProduct,
    listId = itemListId,
    listName = series.name
  ) => {
    const outOfStock = product.stockQty <= 0;
    const productHref = `/product/${product.slug}`;

    return (
      <article
        key={product.id}
        className="rounded-2xl border bg-white p-4 transition hover:bg-gray-50"
      >
        <TrackedProductLink
          href={productHref}
          itemId={product.id}
          itemName={product.name}
          price={product.retailPrice}
          itemBrand={series.brand}
          itemListId={listId}
          itemListName={listName}
          className="block"
        >
          <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50 p-3">
            <Image
              src={product.imageSrc || "/products/placeholder.webp"}
              alt={product.name}
              width={500}
              height={500}
              className="h-48 w-auto object-contain"
            />
          </div>

          <h3 className="mt-3 font-semibold text-[color:var(--text-main)]">
            {product.name}
          </h3>
        </TrackedProductLink>

        <p className="mt-1 text-lg font-bold text-[color:var(--brand-blue)]">
          GHS {product.retailPrice.toFixed(2)}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {outOfStock ? "Currently out of stock" : "Available to order"}
        </p>

        <TrackedProductLink
          href={productHref}
          itemId={product.id}
          itemName={product.name}
          price={product.retailPrice}
          itemBrand={series.brand}
          itemListId={listId}
          itemListName={listName}
          className="btn-outline mt-4 inline-flex w-full items-center justify-center px-4 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
        >
          View Product
        </TrackedProductLink>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-6 text-white shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            Textbook Series
          </p>

          <h1 className="text-3xl font-bold">{series.heading}</h1>

          <p className="mt-3 max-w-3xl text-white/90">{series.intro}</p>

          <p className="mt-3 max-w-3xl text-sm text-white/80">
            Availability may vary. If you have a school list or need a specific
            title from this Series, send us your requirements and we will help
            you check the available selection.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/category/textbooks"
              linkLocation="series_page_hero"
              contentType="textbook_collection"
              contentName={series.name}
              className="rounded-xl bg-white px-5 py-2 font-semibold text-blue-900"
            >
              Browse All Textbooks
            </TrackedLink>

            <TrackedLink
              href="/school-list-items-kasoa"
              linkLocation="series_page_hero"
              contentType="school_list"
              contentName={series.name}
              className="rounded-xl border border-white/60 px-5 py-2 font-semibold text-white"
            >
              School List Shopping
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233246011773?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="series_page_hero"
              productName={series.name}
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Enquire on WhatsApp
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      {isExcellence && (
        <section className="mx-auto max-w-6xl px-4 pb-8">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-2xl font-bold text-[color:var(--text-main)]">
              Excellence Books by School Level
            </h2>

            <p className="mt-2 max-w-4xl text-gray-600">
              Excellence Series covers several stages of school education.
              Browse the available DeeGlobalGH catalogue by level to find books
              for Pre-School, Basic School, Junior High School and Senior High
              School.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {excellenceStages.map((stage) => (
                <a
                  key={stage.id}
                  href={`#${stage.id}`}
                  className="rounded-xl border bg-gray-50 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-gray-100"
                >
                  {stage.heading.replace("Excellence ", "")}
                  {stage.products.length > 0
                    ? ` (${stage.products.length})`
                    : ""}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isExcellence && (
        <section className="mx-auto max-w-6xl px-4 pb-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">
                Available {series.name} Books
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {products.length} product{products.length === 1 ? "" : "s"}{" "}
                currently listed in this Series.
              </p>
            </div>

            <TrackedLink
              href="/shop"
              linkLocation="series_product_collection"
              contentType="shop"
              contentName={series.name}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50"
            >
              Shop All Products
            </TrackedLink>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6">
              <p className="font-semibold">
                No {series.name} products are currently displayed online.
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Please contact DeeGlobalGH if you need a particular title or
                have a school list you would like us to check.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => renderProductCard(product))}
            </div>
          )}
        </section>
      )}

      {isExcellence && (
        <section className="mx-auto max-w-6xl px-4 pb-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">
                Available Excellence Series Books
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {products.length} product{products.length === 1 ? "" : "s"}{" "}
                currently listed online across the Excellence Series.
              </p>
            </div>

            <TrackedLink
              href="/shop"
              linkLocation="series_product_collection"
              contentType="shop"
              contentName={series.name}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50"
            >
              Shop All Products
            </TrackedLink>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6">
              <p className="font-semibold">
                No Excellence Series products are currently displayed online.
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Please contact DeeGlobalGH if you need a particular Excellence
                title or have a school list you would like us to check.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {excellenceStages.map((stage) => (
                <section
                  id={stage.id}
                  key={stage.id}
                  className="scroll-mt-24"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-[color:var(--text-main)]">
                      {stage.heading}
                    </h2>

                    <p className="mt-1 max-w-3xl text-sm text-gray-600">
                      {stage.description}
                    </p>
                  </div>

                  {stage.products.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-5">
                      <p className="text-sm text-gray-600">
                        No products from this Excellence level are currently
                        displayed online.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {stage.products.map((product) =>
                        renderProductCard(
                          product,
                          `series_excellence_${stage.id.replace(/-/g, "_")}`,
                          stage.heading
                        )
                      )}
                    </div>
                  )}
                </section>
              ))}

              {ungroupedExcellenceProducts.length > 0 && (
                <section id="other-excellence-books" className="scroll-mt-24">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-[color:var(--text-main)]">
                      Other Excellence Series Books
                    </h2>

                    <p className="mt-1 max-w-3xl text-sm text-gray-600">
                      Additional Excellence Series titles currently available
                      from DeeGlobalGH.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ungroupedExcellenceProducts.map((product) =>
                      renderProductCard(
                        product,
                        "series_excellence_other",
                        "Other Excellence Series Books"
                      )
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                Browse Other Textbook Series
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Explore other textbook Series available from DeeGlobalGH.
              </p>
            </div>

            <TrackedLink
              href="/series"
              linkLocation="series_cross_navigation"
              contentType="textbook_series_hub"
              contentName={series.name}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50"
            >
              View All Textbook Series
            </TrackedLink>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PUBLIC_SERIES.filter(
              (otherSeries) => otherSeries.slug !== series.slug
            ).map((otherSeries) => (
              <TrackedLink
                key={otherSeries.slug}
                href={`/series/${otherSeries.slug}`}
                linkLocation="series_cross_navigation"
                contentType="textbook_series"
                contentName={otherSeries.name}
                className="rounded-xl border bg-gray-50 px-4 py-3 font-semibold text-[color:var(--brand-blue)] transition hover:bg-gray-100"
              >
                {otherSeries.name}
              </TrackedLink>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">
            Need Help Finding {series.slug === "a1-series" ? "an" : "a"}{" "}
            {series.name} Book?
          </h2>

          <p className="mt-2 max-w-3xl text-gray-600">
            Send DeeGlobalGH the book title, class or level, or your complete
            school list. We can help you check the relevant school supplies and
            available books from our Kasoa shop.
          </p>

          <TrackedWhatsAppLink
            href={`https://wa.me/233246011773?text=${encodeURIComponent(
              whatsappMessage
            )}`}
            linkLocation="series_page_footer"
            productName={series.name}
            className="mt-4 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300"
          >
            Send Your Enquiry
          </TrackedWhatsAppLink>
        </div>
      </section>

      <PageJumpNav />
    </main>
  );
}
