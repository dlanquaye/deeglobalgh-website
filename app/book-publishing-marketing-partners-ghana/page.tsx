import type { Metadata } from "next";
import Link from "next/link";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PAGE_PATH = "/book-publishing-marketing-partners-ghana";

const whatsappUrl =
  "https://wa.me/233246011773?text=" +
  encodeURIComponent(
    "Hello DeeGlobalGH, I am interested in discussing a book marketing or publisher partnership. Please assist me."
  );

export const metadata: Metadata = {
  title: "Book Marketing & Publisher Partnerships in Ghana | DeeGlobalGH",
  description:
    "Are you a publisher or author looking for a book marketing partner in Ghana? Explore online promotion, retail sales and distribution opportunities with DeeGlobalGH.",
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}${PAGE_PATH}`,
    title: "Reach More Book Buyers in Ghana | DeeGlobalGH",
    description:
      "Publishers, authors and book owners can explore book marketing, online sales and distribution partnerships with DeeGlobalGH.",
  },
};

const opportunities = [
  {
    title: "Online Book Marketing",
    description:
      "Discuss how your titles could be presented to customers searching for educational books through our website and digital marketing channels.",
  },
  {
    title: "Retail and Reseller Partnerships",
    description:
      "Explore possible wholesale, resale or commission-based sales arrangements for suitable titles.",
  },
  {
    title: "Schools and Institutional Orders",
    description:
      "Discuss opportunities to introduce relevant books to teachers, parents, schools and educational buyers.",
  },
  {
    title: "Order Fulfilment and Distribution",
    description:
      "Explore practical arrangements for preparing and dispatching customer orders, subject to agreed terms and delivery capabilities.",
  },
];

export default function BookMarketingPartnersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Book Marketing Partnerships</span>
      </nav>

      <section className="rounded-2xl bg-blue-900 px-6 py-10 text-white md:px-10 md:py-14">
        <p className="text-sm font-semibold text-yellow-300">
          DeeGlobalGH | Book Marketing Partnerships
        </p>

        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight md:text-4xl">
          Looking for a Partner to Market and Sell Your Books in Ghana?
        </h1>

        <p className="mt-5 max-w-3xl leading-7 text-blue-50">
          Reach more schools, parents and students through DeeGlobalGH.
          We welcome enquiries from publishers, authors and book owners
          interested in discussing online marketing, retail sales and
          distribution opportunities for suitable books.
        </p>

        <p className="mt-3 text-sm text-blue-100">
          Based at Kasoa New Market, Ghana.
        </p>

        <TrackedWhatsAppLink
          href={whatsappUrl}
          linkLocation="publisher_partnership_hero"
          className="mt-7 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-bold text-blue-950 transition hover:bg-yellow-300"
        >
          Discuss a Book Partnership
        </TrackedWhatsAppLink>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-blue-900">
          Who Can Partner With DeeGlobalGH?
        </h2>

        <p className="mt-3 max-w-4xl leading-7 text-gray-700">
          We are interested in hearing from educational publishers,
          independent authors, textbook producers, distributors and
          owners of relevant learning materials who want to explore
          additional sales and marketing channels in Ghana.
        </p>

        <p className="mt-4 max-w-4xl leading-7 text-gray-700">
          Our main retail focus is textbooks, educational books,
          exam preparation materials and school supplies.
          Partnership proposals are reviewed individually.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-blue-900">
          Book Marketing and Distribution Opportunities
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {opportunities.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border bg-white p-6"
            >
              <h3 className="text-lg font-bold text-blue-900">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-gray-700">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-gray-50 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-blue-900">
          How to Propose a Partnership
        </h2>

        <ol className="mt-5 list-decimal space-y-4 pl-6 text-gray-700">
          <li>
            Introduce your publishing company, authorship or
            ownership of the books.
          </li>
          <li>
            Share your book titles, subjects, target readers,
            sample covers and current catalogue.
          </li>
          <li>
            Explain whether you are seeking marketing, retail
            distribution, resale or another arrangement.
          </li>
          <li>
            Where relevant, provide wholesale prices,
            recommended retail prices and proposed commercial terms.
          </li>
          <li>
            We will review the proposal and discuss whether
            there is a suitable opportunity to work together.
          </li>
        </ol>

        <p className="mt-5 text-sm text-gray-600">
          Listings, promotions, commissions and distribution arrangements
          are subject to separate agreement. Enquiries do not guarantee
          acceptance or sales.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-blue-900">
          Frequently Asked Questions
        </h2>

        <div className="mt-5 space-y-6">
          <div>
            <h3 className="font-bold">
              Do you work with independent authors?
            </h3>
            <p className="mt-2 text-gray-700">
              Independent authors are welcome to send proposals
              for books relevant to our customers.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Can publishers discuss marketing arrangements?
            </h3>
            <p className="mt-2 text-gray-700">
              Yes. We welcome discussions about appropriate
              digital promotion, retail sales and marketing terms.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Do you guarantee sales or nationwide distribution?
            </h3>
            <p className="mt-2 text-gray-700">
              No. Each proposal is assessed individually,
              and any agreed services, locations, fees and
              responsibilities are established before work begins.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Do educational books need curriculum approval?
            </h3>
            <p className="mt-2 text-gray-700">
              Where curriculum approval is relevant,
              publishers should provide supporting documentation.
              We verify claims before presenting books as approved.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-blue-50 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-blue-900">
          Let's Explore a Book Marketing Partnership
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-gray-700">
          If you publish or own educational books and want to reach
          more potential buyers in Ghana, introduce your titles
          and proposed arrangement to DeeGlobalGH.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <TrackedWhatsAppLink
            href={whatsappUrl}
            linkLocation="publisher_partnership_bottom"
            className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
          >
            Contact Us on WhatsApp
          </TrackedWhatsAppLink>

          <Link
            href="/shop"
            className="rounded-xl border border-blue-900 px-6 py-3 font-bold text-blue-900 transition hover:bg-white"
          >
            Explore Our Online Shop
          </Link>
        </div>

        <p className="mt-5 text-sm text-gray-600">
          WhatsApp: 0246 011 773 | Calls: 027 003 0000
        </p>
      </section>
    </main>
  );
}