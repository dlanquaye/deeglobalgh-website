import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PAGE_PATH = "/tamak-series-jhs-questions-and-answers";

const TAMAK_BOOKS = [
  { sku: "DG-JHS-SCI-TAM-001", subject: "Science" },
  { sku: "DG-JHS-SOC-TAM-002", subject: "Social Studies" },
  { sku: "DG-JHS-MTH-TAM-003", subject: "Mathematics" },
  { sku: "DG-JHS-ENG-TAM-004", subject: "English Language" },
  { sku: "DG-JHS-CAD-TAM-005", subject: "Creative Arts & Design" },
  { sku: "DG-JHS-CRT-TAM-006", subject: "Career Technology" },
  {
    sku: "DG-JHS-RME-TAM-007",
    subject: "Religious and Moral Education",
  },
] as const;

const whatsappUrl =
  "https://wa.me/233246011773?text=" +
  encodeURIComponent(
    "Hello DeeGlobalGH, I am interested in Tamak Series Practical Questions & Answers for Basic 7, 8 and 9. Please help me confirm the subjects, prices and availability."
  );

export const metadata: Metadata = {
  title: "Tamak Series Questions & Answers for JHS in Ghana | DeeGlobalGH",
  description:
    "Shop Tamak Series Practical Questions & Answers Simplified for Basic 7, 8 and 9. Explore seven JHS subjects, view prices and enquire at DeeGlobalGH in Kasoa.",
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}${PAGE_PATH}`,
    title: "Tamak Series JHS Questions & Answers | DeeGlobalGH",
    description:
      "Explore Tamak Series revision and examination preparation books for Basic 7, 8 and 9. Browse seven subjects at DeeGlobalGH.",
  },
  twitter: {
    card: "summary",
    title: "Tamak Series JHS Questions & Answers | DeeGlobalGH",
    description:
      "Browse Tamak Series books for Basic 7, 8 and 9, with individual subjects and current prices.",
  },
};

function formatPrice(price: number) {
  return `GH₵${price.toFixed(2)}`;
}

export default async function TamakSeriesPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany<{
    select: {
      sku: true;
      name: true;
      slug: true;
      retailPrice: true;
      imageSrc: true;
      imageAlt: true;
    };
  }>>> = [];

  let catalogueUnavailable = false;

  try {
    products = await prisma.product.findMany({
      where: {
        sku: { in: TAMAK_BOOKS.map((book) => book.sku) },
        isActive: true,
        websiteVisible: true,
        imageSrc: { not: "" },
      },
      select: {
        sku: true,
        name: true,
        slug: true,
        retailPrice: true,
        imageSrc: true,
        imageAlt: true,
      },
    });
  } catch (error) {
    console.error("Tamak landing page product query failed:", error);
    catalogueUnavailable = true;
  }

  const listedBooks = TAMAK_BOOKS.map((book) => ({
    ...book,
    product: products.find((product) => product.sku === book.sku),
  })).filter((book) => Boolean(book.product));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-sm text-gray-600"
      >
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/category/exam-materials/jhs"
          className="hover:underline"
        >
          JHS Exam Materials
        </Link>
        <span className="mx-2">/</span>
        <span aria-current="page">Tamak Series</span>
      </nav>

      <section className="rounded-2xl bg-blue-900 px-6 py-10 text-white md:px-10 md:py-14">
        <p className="text-sm font-bold tracking-wide text-yellow-300">
          DEEGLOBALGH | KASOA NEW MARKET
        </p>

        <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight md:text-4xl">
          Tamak Series Practical Questions &amp; Answers
          for Basic 7, 8 &amp; 9
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50">
          Looking for Tamak Series Questions and Answers books in
          Ghana? Explore the Practical Questions &amp; Answers
          Simplified series for Junior High School students.
          Choose the subjects you need for revision, classwork
          and examination preparation, including BECE preparation.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100">
          Browse individual book covers and current selling prices.
          DeeGlobalGH is located at Kasoa New Market. Customers
          elsewhere in Ghana can enquire about suitable delivery
          arrangements before placing an order.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#tamak-books"
            className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 font-bold text-blue-950 transition hover:bg-yellow-300"
          >
            Explore the Seven Books
          </a>

          <TrackedWhatsAppLink
            href={whatsappUrl}
            linkLocation="tamak_series_hero"
            className="inline-flex items-center justify-center rounded-xl border border-white px-5 py-3 font-bold text-white transition hover:bg-white hover:text-blue-900"
          >
            Enquire on WhatsApp
          </TrackedWhatsAppLink>
        </div>
      </section>

      <section id="tamak-books" className="scroll-mt-8 pt-12">
        <h2 className="text-2xl font-extrabold text-blue-900 md:text-3xl">
          Explore Tamak Series Books by Subject
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-gray-700">
          Find the Tamak Series subject you need for Basic 7,
          Basic 8 or Basic 9. Each book below links to its own
          DeeGlobalGH product page for further details.
        </p>

        {catalogueUnavailable ? (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5 text-gray-800">
            We could not retrieve the current catalogue at the moment.
            Please try again or contact DeeGlobalGH to confirm
            availability and prices.
          </div>
        ) : listedBooks.length === 0 ? (
          <div className="mt-6 rounded-xl border p-5 text-gray-700">
            No Tamak titles are currently listed for online browsing.
            Please enquire with DeeGlobalGH for availability.
          </div>
        ) : (
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listedBooks.map(({ sku, subject, product }) => {
              if (!product) return null;

              return (
                <article
                  key={sku}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="block"
                    aria-label={`View ${subject} Tamak Series book`}
                  >
                    <div className="relative h-72 bg-gray-50 p-4">
                      <Image
                        src={product.imageSrc}
                        alt={product.imageAlt || product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-4"
                      />
                    </div>
                  </Link>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      JHS | Basic 7, 8 &amp; 9
                    </p>

                    <h3 className="mt-2 min-h-12 text-lg font-bold leading-6 text-gray-900">
                      {subject}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Tamak Series Practical Questions &amp; Answers
                      Simplified
                    </p>

                    <p className="mt-4 text-2xl font-extrabold text-blue-900">
                      {formatPrice(product.retailPrice)}
                    </p>

                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                      View Book Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-5 text-sm text-gray-600">
          Prices are retrieved from the DeeGlobalGH catalogue.
          Please confirm current availability before ordering.
        </p>
      </section>

      <section className="mt-14 rounded-2xl bg-gray-50 p-6 md:p-9">
        <h2 className="text-2xl font-extrabold text-blue-900">
          Which Tamak Series Subjects Can You Buy?
        </h2>

        <p className="mt-4 leading-7 text-gray-700">
          Our Tamak Series collection covers Science, Social Studies,
          Mathematics, English Language, Creative Arts &amp; Design,
          Career Technology, and Religious and Moral Education.
          These are practical questions-and-answers books intended
          to support JHS study and revision.
        </p>

        <p className="mt-4 leading-7 text-gray-700">
          Parents and guardians can choose individual subjects
          according to their child&apos;s needs. Teachers and schools
          may also enquire about multiple copies and availability.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold text-blue-900">
          How to Order Tamak Series Books from DeeGlobalGH
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              number: "01",
              heading: "Select your subjects",
              description:
                "Browse the book covers and open individual product pages to identify the titles you need.",
            },
            {
              number: "02",
              heading: "Confirm your order",
              description:
                "Send the subjects and quantities you want. We will help confirm prices and availability.",
            },
            {
              number: "03",
              heading: "Arrange collection or delivery",
              description:
                "Visit us at Kasoa New Market or discuss a suitable delivery arrangement for your location in Ghana.",
            },
          ].map((step) => (
            <div key={step.number} className="rounded-xl border p-5">
              <span className="text-sm font-extrabold text-yellow-600">
                STEP {step.number}
              </span>
              <h3 className="mt-3 text-lg font-bold text-blue-900">
                {step.heading}
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold text-blue-900">
          Frequently Asked Questions
        </h2>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border p-5">
            <h3 className="font-bold text-gray-900">
              Are the Tamak Series books suitable for Basic 7, 8 and 9?
            </h3>
            <p className="mt-2 leading-7 text-gray-700">
              The listed Tamak Series Practical Questions &amp;
              Answers Simplified titles are presented for Basic 7,
              Basic 8 and Basic 9 students.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h3 className="font-bold text-gray-900">
              Can I buy just one subject?
            </h3>
            <p className="mt-2 leading-7 text-gray-700">
              Yes. Browse individual subjects and enquire about
              the titles and quantities you need.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h3 className="font-bold text-gray-900">
              Where can I buy Tamak Series books in Kasoa?
            </h3>
            <p className="mt-2 leading-7 text-gray-700">
              Visit DeeGlobalGH at Kasoa New Market. You can also
              contact us before visiting to confirm availability.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h3 className="font-bold text-gray-900">
              Can customers outside Kasoa enquire about delivery?
            </h3>
            <p className="mt-2 leading-7 text-gray-700">
              Yes. Tell us your location and the subjects required.
              Our team will discuss available delivery arrangements,
              transport costs and payment details with you.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 rounded-2xl bg-blue-900 p-7 text-white md:p-10">
        <h2 className="text-2xl font-extrabold">
          Need Tamak Series Books for Your Child or School?
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-blue-50">
          Send us the subjects you need. DeeGlobalGH can help
          confirm the available titles, current prices and
          suitable collection or delivery arrangements.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <TrackedWhatsAppLink
            href={whatsappUrl}
            linkLocation="tamak_series_bottom_cta"
            className="inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-bold text-blue-950 hover:bg-yellow-300"
          >
            Ask About Tamak Books
          </TrackedWhatsAppLink>

          <Link
            href="/category/exam-materials/jhs"
            className="inline-flex rounded-xl border border-white px-5 py-3 font-bold text-white hover:bg-white hover:text-blue-900"
          >
            Browse All JHS Exam Materials
          </Link>
        </div>

        <p className="mt-5 text-sm text-blue-100">
          DeeGlobalGH | Kasoa New Market, Ghana
          {" | "}WhatsApp: 0246 011 773
          {" | "}Calls: 027 003 0000
        </p>
      </section>
    </main>
  );
}