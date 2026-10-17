import type { Metadata } from "next";
import Image from "next/image";

import TrackedLink from "@/app/components/TrackedLink";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PAGE_URL = `${SITE_URL}/conquering-physics-shs-textbook-ghana`;
const PRODUCT_URL =
  `${SITE_URL}/product/conquering-senior-high-school-physics-shs-1-3`;

const PRODUCT_SKU = "TXT-ADW-PHY-SHS123";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conquering Physics SHS 1-3 in Kasoa | DeeGlobalGH",
  description:
    "Buy Conquering Senior High School Physics SHS 1-3 by Adwinsa in Kasoa. Combined SHS Physics textbook for Senior High School students. Order from DeeGlobalGH at Kasoa New Market.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Conquering Physics SHS 1-3 | DeeGlobalGH Kasoa",
    description:
      "Find Conquering Senior High School Physics SHS 1-3 by Adwinsa at DeeGlobalGH in Kasoa. Check current price and availability before ordering.",
    url: PAGE_URL,
    siteName: "DeeGlobalGH",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/products/conquering-senior-high-school-physics-shs-1-3.webp`,
        alt: "Conquering Senior High School Physics SHS 1-3 textbook",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conquering Physics SHS 1-3 | DeeGlobalGH",
    description:
      "Buy Conquering Senior High School Physics SHS 1-3 in Kasoa from DeeGlobalGH.",
    images: [
      `${SITE_URL}/products/conquering-senior-high-school-physics-shs-1-3.webp`,
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

export default async function ConqueringPhysicsPage() {
  const product = await prisma.product.findUnique({
    where: {
      sku: PRODUCT_SKU,
    },
    select: {
      name: true,
      slug: true,
      brand: true,
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
    "/products/conquering-senior-high-school-physics-shs-1-3.webp";

  const price =
    typeof product?.retailPrice === "number"
      ? product.retailPrice
      : 300;

  const whatsappMessage =
    "Hello DeeGlobalGH, I would like to buy Conquering Senior High School Physics SHS 1-3. Please confirm current availability for me.";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Conquering Senior High School Physics - SHS 1-3",
    image: [
      `${SITE_URL}/products/conquering-senior-high-school-physics-shs-1-3.webp`,
    ],
    description:
      "Conquering Senior High School Physics is a combined SHS 1-3 Physics textbook by Adwinsa for Senior High School students in Ghana.",
    sku: PRODUCT_SKU,
    brand: {
      "@type": "Brand",
      name: "Adwinsa",
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
        name: "Conquering Physics SHS 1-3",
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
            linkLocation="conquering_physics_breadcrumb"
            contentType="shs_textbook_collection"
            contentName="SHS Textbooks"
            className="font-semibold text-blue-900 hover:underline"
          >
            SHS Textbooks in Kasoa
          </TrackedLink>

          <span>/</span>

          <span>Conquering Physics</span>
        </div>

        <div className="grid gap-8 rounded-3xl border bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-4">
            <Image
              src={imageSrc}
              alt={
                product?.imageAlt ||
                "Conquering Senior High School Physics SHS 1-3 textbook"
              }
              width={685}
              height={913}
              priority
              className="h-auto max-h-[680px] w-auto rounded-xl object-contain"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
              Adwinsa | Senior High School Physics
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-blue-950 md:text-4xl">
              Conquering Senior High School Physics - SHS 1-3
            </h1>

            <p className="mt-4 text-lg leading-8 text-gray-700">
              Looking for <strong>Conquering Physics</strong> for Senior High
              School? DeeGlobalGH stocks the combined SHS 1-3 Physics textbook
              from Adwinsa for students, parents, teachers and schools in Kasoa.
            </p>

            <div className="mt-6 rounded-2xl border bg-blue-50 p-5">
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
                Stock can change quickly during the school term, so customers
                travelling to Kasoa New Market may confirm availability before
                coming.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink
                href={productHref}
                linkLocation="conquering_physics_hero"
                contentType="product"
                contentName="Conquering Physics SHS 1-3"
                className="rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800"
              >
                View Product & Order
              </TrackedLink>

              <TrackedWhatsAppLink
                href={`https://wa.me/233270030000?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                linkLocation="conquering_physics_hero"
                productName="Conquering Physics SHS 1-3"
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
              This is a combined Senior High School Physics book covering the
              SHS 1-3 range rather than separate books for each year.
            </p>
          </article>

          <article className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Subject
            </p>

            <h2 className="mt-2 text-xl font-bold text-blue-950">
              Physics
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Suitable for customers looking specifically for an SHS Physics
              textbook or combined Physics learning material for Senior High
              School.
            </p>
          </article>

          <article className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Authors
            </p>

            <h2 className="mt-2 text-xl font-bold text-blue-950">
              Kojo Borbor & T. Dzidefo Afram
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              The book cover identifies Kojo Borbor and T. Dzidefo Afram as
              the authors of Conquering Senior High School Physics.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold text-blue-950">
            About Conquering Senior High School Physics
          </h2>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            Conquering Senior High School Physics is an Adwinsa Physics book
            for SHS students. The cover identifies it as an SHS 1-3 combined
            title and states that it is based on the standards-based Physics
            curriculum for secondary education.
          </p>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            Customers may search for this title as{" "}
            <strong>Conquering Physics</strong>,{" "}
            <strong>Adwinsa Physics</strong>,{" "}
            <strong>SHS Physics textbook</strong>, or{" "}
            <strong>Physics book for SHS 1, 2 and 3</strong>. If this is the
            title on your school book list, you can order it from DeeGlobalGH
            or contact us to confirm current availability.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold text-blue-950">
            Where to Buy Conquering Physics in Kasoa
          </h2>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            DeeGlobalGH serves students, parents, teachers and schools looking
            for SHS textbooks in Kasoa. Conquering Physics can be ordered from
            our Kasoa New Market shop, subject to current stock.
          </p>

          <p className="mt-4 max-w-4xl leading-8 text-gray-700">
            You can ask us to confirm the book before travelling, arrange
            collection at Kasoa New Market, or discuss available delivery
            options.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href="/locations/kasoa-new-market"
              linkLocation="conquering_physics_location"
              contentType="store_location"
              contentName="Kasoa New Market Branch"
              className="rounded-xl border px-5 py-3 font-semibold text-blue-900 hover:bg-gray-50"
            >
              Kasoa New Market Branch
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="conquering_physics_location"
              productName="Conquering Physics SHS 1-3"
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
            Looking for More SHS Textbooks?
          </h2>

          <p className="mt-3 max-w-4xl leading-7 text-blue-100">
            DeeGlobalGH stocks and sources a growing range of SHS books across
            Physics, General Science, English Language, Mathematics, Biology,
            Chemistry, Computing, Social Studies, Economics and other Senior
            High School subjects.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href="/shs-textbooks-in-kasoa"
              linkLocation="conquering_physics_related"
              contentType="shs_textbook_collection"
              contentName="SHS Textbooks"
              className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-950"
            >
              Browse SHS Textbooks
            </TrackedLink>

            <TrackedLink
              href="/shs-prospectus-shopping-kasoa"
              linkLocation="conquering_physics_related"
              contentType="shs_prospectus"
              contentName="Conquering Physics SHS 1-3"
              className="rounded-xl border border-white/50 px-5 py-3 font-semibold text-white"
            >
              Send Your SHS Prospectus
            </TrackedLink>
          </div>
        </div>
      </section>
    </main>
  );
}