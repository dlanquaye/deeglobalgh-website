import type { Metadata } from "next";
import TrackedLink from "@/app/components/TrackedLink";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import { PUBLIC_SERIES } from "@/lib/series";

const SITE_URL = "https://www.shopdeeglobalgh.com";

export const metadata: Metadata = {
  title: "Textbook Series in Ghana | DeeGlobalGH",
  description:
    "Browse textbook Series available from DeeGlobalGH in Kasoa, including Best Brain, Golden, Excellence, Wise Ant, Don and Essential. Find school books for collection or delivery.",
  alternates: {
    canonical: `${SITE_URL}/series`,
  },
  openGraph: {
    title: "Textbook Series in Ghana | DeeGlobalGH",
    description:
      "Browse textbook Series available from DeeGlobalGH in Kasoa, including Best Brain, Golden, Excellence, Wise Ant, Don and Essential.",
    url: `${SITE_URL}/series`,
  },
  twitter: {
    card: "summary",
    title: "Textbook Series in Ghana | DeeGlobalGH",
    description:
      "Browse textbook Series available from DeeGlobalGH in Kasoa, including Best Brain, Golden, Excellence, Wise Ant, Don and Essential.",
  },
};

export default function SeriesHubPage() {
  const whatsappMessage =
    "Hello DeeGlobalGH, I need help finding textbooks for school. Please assist me with the available Series and titles.";

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-6 text-white shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            School Textbooks
          </p>

          <h1 className="text-3xl font-bold">
            Browse Textbook Series in Ghana
          </h1>

          <p className="mt-3 max-w-3xl text-white/90">
            Explore textbook Series available from DeeGlobalGH, including Best
            Brain, Golden, Excellence, Wise Ant, Don and Essential. Choose a
            Series below to browse the books currently displayed online.
          </p>

          <p className="mt-3 max-w-3xl text-sm text-white/80">
            Availability may vary. If you need a particular title, class or
            subject, or you have a complete school list, send us your
            requirements and we will help you check the available selection.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/category/textbooks"
              linkLocation="series_hub_hero"
              contentType="textbook_collection"
              contentName="Textbook Series"
              className="rounded-xl bg-white px-5 py-2 font-semibold text-blue-900"
            >
              Browse All Textbooks
            </TrackedLink>

            <TrackedLink
              href="/school-list-items-kasoa"
              linkLocation="series_hub_hero"
              contentType="school_list"
              contentName="Textbook Series"
              className="rounded-xl border border-white/60 px-5 py-2 font-semibold text-white"
            >
              School List Shopping
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="series_hub_hero"
              productName="Textbook Series"
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Ask on WhatsApp
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-5">
          <h2 className="text-2xl font-bold">Choose a Textbook Series</h2>

          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Browse each Series to see the textbooks and learning materials
            currently listed on the DeeGlobalGH website.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_SERIES.map((series) => (
            <article
              key={series.slug}
              className="flex flex-col rounded-2xl border bg-white p-5 transition hover:bg-gray-50"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Textbook Series
              </p>

              <h2 className="mt-2 text-xl font-bold text-[color:var(--text-main)]">
                {series.name}
              </h2>

              <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                {series.intro}
              </p>

              <TrackedLink
                href={`/series/${series.slug}`}
                linkLocation="series_hub_collection"
                contentType="textbook_series"
                contentName={series.name}
                className="btn-outline mt-5 inline-flex w-full items-center justify-center px-4 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
              >
                Browse {series.name}
              </TrackedLink>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">
            Shopping With a School Book List?
          </h2>

          <p className="mt-2 max-w-3xl text-gray-600">
            You do not have to search through every Series individually. Send
            DeeGlobalGH your school list, book titles, class or level and we can
            help you check the relevant textbooks and other school supplies
            available from our Kasoa shop.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <TrackedLink
              href="/school-list-items-kasoa"
              linkLocation="series_hub_footer"
              contentType="school_list"
              contentName="Textbook Series"
              className="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              School List Shopping
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="series_hub_footer"
              productName="Textbook Series"
              className="inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300"
            >
              Send Your Enquiry
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>
    </main>
  );
}
