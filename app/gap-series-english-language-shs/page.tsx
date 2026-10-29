import type { Metadata } from "next";
import Image from "next/image";

import TrackedLink from "@/app/components/TrackedLink";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PAGE_URL = `${SITE_URL}/gap-series-english-language-shs`;
const PRODUCT_URL =
  `${SITE_URL}/product/gap-series-english-language-shs-1-2-3`;

const PRODUCT_SKU = "TXT-GAP-ENG-SHS123";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GAP Series English Language SHS 1-3 in Kasoa | DeeGlobalGH",
  description:
    "Buy GAP Series English Language for Senior High Schools 1, 2 & 3 in Kasoa. By Eric Obeng (Prof. O.B.) and based on Ghana's SHS, SHTS and STEM curriculum.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "GAP Series English Language SHS 1-3 | DeeGlobalGH",
    description:
      "Find GAP Series English Language for SHS 1-3 at DeeGlobalGH in Kasoa. Based on Ghana's SHS, SHTS and STEM curriculum.",
    url: PAGE_URL,
    siteName: "DeeGlobalGH",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/products/gap-series-english-language-shs-1-2-3.webp`,
        alt: "GAP Series English Language for Senior High Schools 1, 2 and 3 textbook",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GAP Series English Language SHS 1-3 | DeeGlobalGH",
    description:
      "Buy GAP Series English Language for SHS 1-3 in Kasoa from DeeGlobalGH.",
    images: [
      `${SITE_URL}/products/gap-series-english-language-shs-1-2-3.webp`,
    ],
  },
};

function formatGhanaCedis(value: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function GapSeriesEnglishPage() {
  const product = await prisma.product.findUnique({
    where: {
      sku: PRODUCT_SKU,
    },
    select: {
      name: true,
      slug: true,
      brand: true,
      author: true,
      retailPrice: true,
      stockQty: true,
      imageSrc: true,
      imageAlt: true,
      isActive: true,
      websiteVisible: true,
    },
  });

  const isAvailable =
    Boolean(product?.isActive) &&
    Boolean(product?.websiteVisible) &&
    (product?.stockQty ?? 0) > 0;

  const productHref = product?.slug
    ? `/product/${product.slug}`
    : "/shs-textbooks-in-kasoa";

  const imageSrc =
    product?.imageSrc ||
    "/products/gap-series-english-language-shs-1-2-3.webp";

  const price =
    typeof product?.retailPrice === "number"
      ? product.retailPrice
      : 200;

  const whatsappMessage =
    "Hello DeeGlobalGH, I would like to buy GAP Series English Language for Senior High Schools 1, 2 & 3. Please confirm current availability for me.";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "GAP Series English Language for Senior High Schools 1, 2 & 3",
    image: [
      `${SITE_URL}/products/gap-series-english-language-shs-1-2-3.webp`,
    ],
    description:
      "GAP Series English Language for Senior High Schools 1, 2 & 3 by Eric Obeng (Prof. O.B.), based on Ghana's SHS, SHTS and STEM curriculum.",
    sku: PRODUCT_SKU,
    brand: {
      "@type": "Brand",
      name: "GAP Series",
    },
    offers: {
      "@type": "Offer",
      url: PRODUCT_URL,
      priceCurrency: "GHS",
      price,
      availability: isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "DeeGlobalGH",
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "SHS Textbooks in Kasoa",
        item: `${SITE_URL}/shs-textbooks-in-kasoa`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "GAP Series English Language SHS 1-3",
        item: PAGE_URL,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <TrackedLink
            href="/shs-textbooks-in-kasoa"
            linkLocation="gap_english_breadcrumb"
            contentType="shs_textbook_collection"
            contentName="SHS Textbooks"
            className="font-semibold text-blue-900 hover:underline"
          >
            SHS Textbooks in Kasoa
          </TrackedLink>

          <span>/</span>

          <span>GAP Series English Language</span>
        </div>

        <div className="grid gap-8 rounded-3xl border bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-4">
            <Image
              src={imageSrc}
              alt={
                product?.imageAlt ||
                "GAP Series English Language for Senior High Schools 1, 2 and 3 textbook"
              }
              width={768}
              height={1024}
              priority
              className="h-auto max-h-[680px] w-auto rounded-xl object-contain"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
              GAP Series | Senior High School English Language
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-blue-950 md:text-4xl">
              GAP Series English Language for Senior High Schools 1, 2 & 3
            </h1>

            <p className="mt-4 text-lg leading-8 text-gray-700">
              A combined English Language textbook for Senior High School
              students by <strong>Eric Obeng (Prof. O.B.)</strong>, available
              from DeeGlobalGH in Kasoa.
            </p>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Curriculum
              </p>

              <p className="mt-2 text-lg font-bold text-blue-950">
                Based on Ghana&apos;s SHS, SHTS and STEM curriculum.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border bg-gray-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Current selling price
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-950">
                {formatGhanaCedis(price)}
              </p>

              <p
                className={`mt-3 font-semibold ${
                  isAvailable ? "text-green-700" : "text-amber-700"
                }`}
              >
                {isAvailable
                  ? "Currently available - subject to sales before confirmation."
                  : "Please contact us to confirm the next available stock."}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Stock can change as books are sold and restocked, so you may
                confirm availability before travelling to Kasoa New Market.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink
                href={productHref}
                linkLocation="gap_english_hero"
                contentType="product"
                contentName="GAP Series English Language SHS 1-3"
                className="rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800"
              >
                View Product & Order
              </TrackedLink>

              <TrackedWhatsAppLink
                href={`https://wa.me/233246011773?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                linkLocation="gap_english_hero"
                productName="GAP Series English Language SHS 1-3"
                className="rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black hover:bg-yellow-300"
              >
                Check on WhatsApp
              </TrackedWhatsAppLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Level
            </p>

            <h2 className="mt-2 text-xl font-bold text-blue-950">
              SHS 1, SHS 2 & SHS 3
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              A combined English Language book designed to support students
              across Senior High School levels 1 to 3.
            </p>
          </article>

          <article className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Subject
            </p>

            <h2 className="mt-2 text-xl font-bold text-blue-950">
              English Language
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              The book covers major English Language areas including oral
              language, reading, grammar, writing and literature.
            </p>
          </article>

          <article className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Author
            </p>

            <h2 className="mt-2 text-xl font-bold text-blue-950">
              Eric Obeng (Prof. O.B.)
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Eric Obeng, popularly identified on the book as Prof. O.B., is
              the author of this GAP Series English Language title.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold text-blue-950">
            About GAP Series English Language
          </h2>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            GAP Series English Language for Senior High Schools 1, 2 & 3 is a
            combined English Language textbook for students in Senior High
            School. The book identifies key strands including Oral Language,
            Reading, Grammar, Writing and Literature.
          </p>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            The book states that it is{" "}
            <strong>
              based on Ghana&apos;s SHS, SHTS and STEM curriculum
            </strong>
            . This makes it relevant to customers looking for English Language
            learning materials for Senior High School, Senior High Technical
            School and STEM-oriented secondary education.
          </p>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            Customers may search for this title as{" "}
            <strong>GAP Series English</strong>,{" "}
            <strong>GAP English Language SHS</strong>,{" "}
            <strong>Prof. O.B. English book</strong>, or{" "}
            <strong>English Language book for SHS 1, 2 and 3</strong>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold text-blue-950">
            Where to Buy GAP Series English Language in Kasoa
          </h2>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            DeeGlobalGH serves parents, students, teachers and schools looking
            for SHS textbooks and learning materials in Kasoa. GAP Series
            English Language for SHS 1-3 is available from our Kasoa New Market
            shop, subject to current stock.
          </p>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            You can confirm availability before travelling, arrange collection
            at Kasoa New Market, or ask about available delivery options.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href="/locations/kasoa-new-market"
              linkLocation="gap_english_location"
              contentType="store_location"
              contentName="Kasoa New Market Branch"
              className="rounded-xl border px-5 py-3 font-semibold text-blue-900 hover:bg-gray-50"
            >
              Kasoa New Market Branch
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233246011773?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="gap_english_location"
              productName="GAP Series English Language SHS 1-3"
              className="rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300"
            >
              Confirm Availability
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl bg-blue-950 p-6 text-white md:p-8">
          <h2 className="text-2xl font-bold">
            Looking for More SHS, SHTS or STEM Textbooks?
          </h2>

          <p className="mt-3 max-w-4xl leading-7 text-blue-100">
            DeeGlobalGH is building a growing range of textbooks and learning
            materials for students across Ghana&apos;s SHS, SHTS and STEM
            curriculum. Send us the title, subject or school book list you need
            and we can help check current availability.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href="/shs-textbooks-in-kasoa"
              linkLocation="gap_english_related"
              contentType="shs_textbook_collection"
              contentName="SHS Textbooks"
              className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-950"
            >
              Browse SHS Textbooks
            </TrackedLink>

            <TrackedLink
              href="/shs-prospectus-shopping-kasoa"
              linkLocation="gap_english_related"
              contentType="shs_prospectus"
              contentName="GAP Series English Language SHS 1-3"
              className="rounded-xl border border-white/50 px-5 py-3 font-semibold text-white"
            >
              Send Your School List
            </TrackedLink>
          </div>
        </div>
      </section>
    </main>
  );
}