import type { Metadata } from "next";
import Link from "next/link";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";

const SITE_URL = "https://www.shopdeeglobalgh.com";

const whatsappUrl =
  "https://wa.me/233246011773?text=" +
  encodeURIComponent(
    "Hello DeeGlobalGH, I want to order textbooks online in Ghana. Please help me confirm availability and arrange delivery."
  );

export const metadata: Metadata = {
  title: "Buy Textbooks Online in Ghana | DeeGlobalGH",
  description:
    "Where to order textbooks online in Ghana? Shop Preschool, Primary, JHS and SHS books at DeeGlobalGH. Send your school list and arrange delivery.",
  alternates: {
    canonical: `${SITE_URL}/order-textbooks-online-ghana`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/order-textbooks-online-ghana`,
    title: "Where to Order Textbooks Online in Ghana | DeeGlobalGH",
    description:
      "Browse school textbooks, send your book list and enquire about delivery arrangements across Ghana. DeeGlobalGH is based at Kasoa New Market.",
  },
};

const steps = [
  {
    title: "Find your textbooks",
    description:
      "Browse available books online or send us the titles, classes, subjects or photographs of your school book list.",
  },
  {
    title: "Confirm availability and prices",
    description:
      "Our team helps you confirm the required editions, availability, quantities and current prices before finalising your order.",
  },
  {
    title: "Arrange payment and delivery",
    description:
      "Tell us your location. We will discuss the available delivery arrangement, transport fare and payment process with you.",
  },
];

export default function OrderTextbooksOnlineGhanaPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Order Textbooks Online in Ghana</span>
      </nav>

      <section className="rounded-2xl bg-blue-900 px-6 py-10 text-white md:px-10">
        <p className="mb-3 text-sm font-semibold text-yellow-300">
          DeeGlobalGH | Kasoa New Market, Ghana
        </p>

        <h1 className="max-w-4xl text-3xl font-bold leading-tight md:text-4xl">
          Where to Order Textbooks Online in Ghana
        </h1>

        <p className="mt-5 max-w-3xl leading-7 text-blue-50">
          Looking for school textbooks without travelling from shop to shop?
          DeeGlobalGH helps parents, students, teachers and schools find
          textbooks for Preschool, Primary, JHS and SHS. Browse online,
          send us your book list and enquire about delivery to your location
          in Ghana.
        </p>

        <p className="mt-3 max-w-3xl text-sm text-blue-100">
          Our physical shop is at Kasoa New Market, but customers outside
          Kasoa can also place orders and arrange delivery.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/shop?category=textbooks"
            className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-blue-950 transition hover:bg-yellow-300"
          >
            Browse Available Textbooks
          </Link>

          <TrackedWhatsAppLink
            href={whatsappUrl}
            linkLocation="national_textbook_landing_hero"
            className="rounded-xl border border-white px-5 py-3 font-bold text-white transition hover:bg-white hover:text-blue-900"
          >
            Send Your Book List
          </TrackedWhatsAppLink>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-blue-900">
          School Textbooks for Different Levels
        </h2>

        <p className="mt-3 max-w-3xl text-gray-700">
          Explore learning materials for Ghana's Standards-Based Curriculum,
          Common Core Programme and SHS curriculum. Ask us to confirm
          the approval status and edition of any particular textbook.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/textbooks-in-kasoa"
            className="rounded-xl border bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
          >
            <h3 className="font-bold text-blue-900">
              Preschool and Primary Textbooks
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Explore early learning and Basic 1–6 books, including
              curriculum-aligned learning materials.
            </p>
          </Link>

          <Link
            href="/jhs-textbooks-in-kasoa"
            className="rounded-xl border bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
          >
            <h3 className="font-bold text-blue-900">JHS Textbooks</h3>
            <p className="mt-2 text-sm text-gray-600">
              Browse JHS learning materials and Common Core Programme
              textbooks for different subjects.
            </p>
          </Link>

          <Link
            href="/shs-textbooks-in-kasoa"
            className="rounded-xl border bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
          >
            <h3 className="font-bold text-blue-900">SHS Textbooks</h3>
            <p className="mt-2 text-sm text-gray-600">
              Find SHS textbooks and learning resources by subject
              and confirm the required editions.
            </p>
          </Link>

          <Link
            href="/exam-materials-in-kasoa"
            className="rounded-xl border bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
          >
            <h3 className="font-bold text-blue-900">
              Exam Preparation Materials
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Explore BECE, WASSCE and other examination preparation
              materials available through DeeGlobalGH.
            </p>
          </Link>
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-gray-50 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-blue-900">
          How to Order Textbooks Online in Ghana
        </h2>

        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-xl border bg-white p-5">
              <p className="text-sm font-bold text-blue-700">
                Step {index + 1}
              </p>
              <h3 className="mt-2 font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-blue-900">
          Delivery Arrangements Across Ghana
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border p-5">
            <h3 className="font-bold text-blue-900">
              Kasoa and Greater Accra
            </h3>
            <p className="mt-3 leading-7 text-gray-700">
              We arrange deliveries within Kasoa, nearby communities
              and Greater Accra using riders. Cash on delivery may
              be possible where available and agreed.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h3 className="font-bold text-blue-900">
              Other Regions of Ghana
            </h3>
            <p className="mt-3 leading-7 text-gray-700">
              Nationwide orders may be dispatched through transport
              stations. You speak with the driver to agree on the
              transport fare before dispatch is completed.
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-4xl leading-7 text-gray-700">
          For transport-station dispatches, once the transport fare
          is confirmed and DeeGlobalGH staff are handing your package
          to the driver, payment for the goods is made to DeeGlobalGH
          via MoMo before the package is released. Delivery arrangements
          depend on your destination and available transport services.
        </p>

        <Link
          href="/locations/kasoa-new-market"
          className="mt-4 inline-block font-semibold text-blue-800 underline underline-offset-4"
        >
          Read our shop location and delivery information
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-blue-900">
          Frequently Asked Questions
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <h3 className="font-bold">
              Can I order textbooks if I do not live in Kasoa?
            </h3>
            <p className="mt-2 text-gray-700">
              Yes. Customers in other parts of Ghana can contact
              DeeGlobalGH to order available textbooks and discuss
              delivery arrangements.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Can I send my school's textbook list?
            </h3>
            <p className="mt-2 text-gray-700">
              Yes. Send your school list through WhatsApp so we can help
              identify the required titles and confirm availability.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Are all textbooks always available?
            </h3>
            <p className="mt-2 text-gray-700">
              Availability and editions vary. Please confirm the
              specific books you need before making payment.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Where is DeeGlobalGH located?
            </h3>
            <p className="mt-2 text-gray-700">
              DeeGlobalGH operates from Kasoa New Market, Ghana.
              Customers can visit the shop or order remotely.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 mb-16 rounded-2xl bg-blue-50 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-blue-900">
          Ready to Order Your Textbooks?
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-gray-700">
          Send us the textbook titles or your school book list.
          We will help confirm availability, prices and the delivery
          arrangement for your location.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <TrackedWhatsAppLink
            href={whatsappUrl}
            linkLocation="national_textbook_landing_bottom"
            className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
          >
            Enquire on WhatsApp
          </TrackedWhatsAppLink>

          <Link
            href="/shop?category=textbooks"
            className="rounded-xl border border-blue-900 px-6 py-3 font-bold text-blue-900 transition hover:bg-white"
          >
            Browse Textbooks
          </Link>
        </div>

        <p className="mt-5 text-sm text-gray-600">
          WhatsApp: 0246 011 773 | Calls: 027 003 0000
        </p>
      </section>
    </main>
  );
}