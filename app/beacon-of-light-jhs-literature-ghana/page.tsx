import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PAGE_URL = `${SITE_URL}/beacon-of-light-jhs-literature-ghana`;

const BEACON_PRODUCT_NAMES = [
  "The Beacon Of Light",
  "The Beacon Of Light Commentary",
  "The Beacon Of Light Workbook",
] as const;

export const metadata: Metadata = {
  title: "The Beacon of Light Books for JHS in Ghana | DeeGlobalGH",
  description:
    "Shop The Beacon of Light, Commentary and Workbook for JHS learners in Ghana. Learn about its 2027 BECE relevance and order from DeeGlobalGH in Kasoa.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "The Beacon of Light Books for JHS in Ghana | DeeGlobalGH",
    description:
      "Find The Beacon of Light main text, Commentary and Workbook for JHS learners. Order from DeeGlobalGH in Kasoa.",
    url: PAGE_URL,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export default async function BeaconOfLightPage() {
  const catalogueProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      websiteVisible: true,
      name: {
        in: [...BEACON_PRODUCT_NAMES],
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      retailPrice: true,
      imageSrc: true,
      stockQty: true,
    },
  });

  const products = BEACON_PRODUCT_NAMES.flatMap((name) => {
    const product = catalogueProducts.find((item) => item.name === name);
    return product ? [product] : [];
  });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Beacon of Light books for JHS learners in Ghana",
    url: PAGE_URL,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `${SITE_URL}/product/${product.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
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
        name: "Subjects",
        item: `${SITE_URL}/subjects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "English",
        item: `${SITE_URL}/subjects/english`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "The Beacon of Light",
        item: PAGE_URL,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 text-sm text-gray-500"
          >
            <Link href="/" className="hover:text-blue-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/subjects/english" className="hover:text-blue-900">
              English
            </Link>
            <span className="mx-2">/</span>
            <span>The Beacon of Light</span>
          </nav>

          <div className="max-w-4xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-700">
              JHS Literature in Ghana
            </p>

            <h1 className="text-3xl md:text-5xl font-bold text-blue-950 leading-tight">
              The Beacon of Light Books for JHS Learners in Ghana
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-700">
              Find The Beacon of Light main literature text, Commentary and
              Workbook from DeeGlobalGH in Kasoa. Browse the current selection,
              check availability and choose the resource your learner needs.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#beacon-books"
                className="rounded-xl bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800"
              >
                View the Books
              </a>

              <TrackedWhatsAppLink
                href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20enquire%20about%20The%20Beacon%20of%20Light%20books.%20Please%20help%20me%20check%20the%20available%20main%20text%2C%20commentary%20and%20workbook."
                linkLocation="beacon_of_light_landing"
                className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
              >
                Enquire on WhatsApp
              </TrackedWhatsAppLink>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Product availability can change. Check the current selection
              below or contact us before travelling to the shop.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h2 className="text-2xl font-bold text-blue-950">
              Why JHS learners are studying The Beacon of Light
            </h2>

            <div className="mt-4 space-y-4 text-gray-700 leading-7">
              <p>
                Ghana&apos;s National Council for Curriculum and Assessment
                (NaCCA) announced The Beacon of Light as the approved prescribed
                literature text for Junior High Schools in Ghana. It replaces
                The Cock Crow and is to be studied as part of the English
                Language curriculum.
              </p>

              <p>
                NaCCA also states that learners preparing for the 2027 Basic
                Education Certificate Examination (BECE) should note that The
                Beacon of Light will be examined.
              </p>

              <p>
                The main text is authored by Joshlyn Yayra Diabo, Adam Ankrah,
                Bryte Okrah and Lucas Zanyoh.
              </p>
            </div>

            <a
              href="https://nacca.gov.gh/introduction-of-the-beacon-of-light-as-the-approved-literature-text-for-junior-high-schools/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block font-semibold text-blue-700 underline underline-offset-4"
            >
              Read the official NaCCA announcement
            </a>
          </div>

          <aside className="rounded-2xl border bg-blue-50 p-6">
            <h2 className="text-xl font-bold text-blue-950">
              Quick information for parents
            </h2>

            <ul className="mt-4 space-y-3 text-gray-700">
              <li>
                <strong>School level:</strong> Junior High School
              </li>
              <li>
                <strong>Curriculum area:</strong> English Language / Literature
              </li>
              <li>
                <strong>BECE relevance:</strong> NaCCA says The Beacon of Light
                will be examined in the 2027 BECE.
              </li>
              <li>
                <strong>Shopping location:</strong> DeeGlobalGH, Kasoa New
                Market
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section id="beacon-books" className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-950">
              The Beacon of Light books available from DeeGlobalGH
            </h2>

            <p className="mt-3 text-gray-600 leading-7">
              We currently list three Beacon of Light resources. Prices, stock
              status and product details below come directly from our current
              catalogue.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border bg-gray-50 p-6">
              <p className="font-semibold text-gray-800">
                The Beacon of Light products are not currently showing in the
                online catalogue.
              </p>
              <p className="mt-2 text-gray-600">
                Please contact DeeGlobalGH to check current availability.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-950">
            Which Beacon of Light book do I need?
          </h2>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-bold text-blue-950">
                The Beacon of Light
              </h3>
              <p className="mt-3 text-gray-600 leading-7">
                This is the prescribed JHS literature text announced by NaCCA.
                It is the main book learners study as part of the English
                Language curriculum.
              </p>
            </article>

            <article className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-bold text-blue-950">
                The Beacon of Light Commentary
              </h3>
              <p className="mt-3 text-gray-600 leading-7">
                NaCCA identifies the Commentary as an accompanying resource that
                provides deeper analysis and insights to support understanding
                of the main text.
              </p>
            </article>

            <article className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-bold text-blue-950">
                The Beacon of Light Workbook
              </h3>
              <p className="mt-3 text-gray-600 leading-7">
                The Workbook is a separate supporting resource available in our
                catalogue alongside the main text and Commentary.
              </p>
            </article>
          </div>

          <div className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5 text-sm leading-6 text-gray-700">
            NaCCA&apos;s published approval information specifically names The
            Beacon of Light and A Commentary on the Beacon of Light. DeeGlobalGH
            does not present the separate Workbook as NaCCA-approved on this
            page.
          </div>
        </div>
      </section>

      <section className="bg-blue-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold">
              Looking for The Beacon of Light in Kasoa?
            </h2>

            <p className="mt-4 max-w-3xl text-blue-100 leading-7">
              DeeGlobalGH serves parents, guardians, teachers and students
              shopping for textbooks and school supplies in Kasoa. You can
              check the books above, order online or contact us on WhatsApp
              before coming to Kasoa New Market.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <TrackedWhatsAppLink
                href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20to%20order%20or%20check%20availability%20for%20The%20Beacon%20of%20Light%20books."
                linkLocation="beacon_of_light_bottom_cta"
                className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
              >
                Check Availability on WhatsApp
              </TrackedWhatsAppLink>

              <Link
                href="/subjects/english"
                className="rounded-xl border border-white/40 px-6 py-3 font-bold text-white hover:bg-white/10"
              >
                Browse English Books
              </Link>

              <Link
                href="/level/jhs-3"
                className="rounded-xl border border-white/40 px-6 py-3 font-bold text-white hover:bg-white/10"
              >
                Browse JHS Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-blue-950">
            Frequently asked questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-bold text-gray-900">
                Is The Beacon of Light the JHS literature book in Ghana?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                Yes. NaCCA announced The Beacon of Light as the approved
                prescribed literature text for Junior High Schools in Ghana.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Will The Beacon of Light be examined in the 2027 BECE?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                Yes. NaCCA specifically states that learners preparing for the
                2027 BECE should note that The Beacon of Light will be examined.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Did The Beacon of Light replace The Cock Crow?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                Yes. NaCCA says The Beacon of Light replaces The Cock Crow,
                which had been used for more than 15 years.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Can I buy The Beacon of Light books in Kasoa?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                DeeGlobalGH lists the main text, Commentary and Workbook. Check
                the current product cards above or contact us to confirm
                availability before visiting Kasoa New Market.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageJumpNav />
    </main>
  );
}