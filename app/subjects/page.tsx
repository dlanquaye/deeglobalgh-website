import type { Metadata } from "next";
import TrackedLink from "@/app/components/TrackedLink";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import { getStandaloneSubjects } from "@/lib/subjects";

const SITE_URL = "https://www.shopdeeglobalgh.com";

export const metadata: Metadata = {
  title: "School Textbooks by Subject in Ghana | DeeGlobalGH",
  description:
    "Browse school textbooks by subject from DeeGlobalGH in Kasoa, including English, Mathematics, Science, Computing, RME, History and Creative Arts.",
  alternates: {
    canonical: `${SITE_URL}/subjects`,
  },
  openGraph: {
    title: "School Textbooks by Subject in Ghana | DeeGlobalGH",
    description:
      "Browse school textbooks by subject from DeeGlobalGH in Kasoa, including English, Mathematics, Science, Computing, RME, History and Creative Arts.",
    url: `${SITE_URL}/subjects`,
  },
  twitter: {
    card: "summary",
    title: "School Textbooks by Subject in Ghana | DeeGlobalGH",
    description:
      "Browse school textbooks by subject from DeeGlobalGH in Kasoa, including English, Mathematics, Science, Computing, RME, History and Creative Arts.",
  },
};

export default function SubjectsHubPage() {
  const subjects = getStandaloneSubjects();

  const whatsappMessage =
    "Hello DeeGlobalGH, I need help finding textbooks by subject. Please assist me with the available books and school levels.";

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-6 text-white shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            School Textbooks
          </p>

          <h1 className="text-3xl font-bold">
            Browse School Textbooks by Subject
          </h1>

          <p className="mt-3 max-w-3xl text-white/90">
            Find textbooks and learning materials by subject from DeeGlobalGH
            in Kasoa. Browse English, Mathematics, Science, Computing, RME,
            History, Creative Arts and other school subjects represented in our
            online textbook catalogue.
          </p>

          <p className="mt-3 max-w-3xl text-sm text-white/80">
            The books displayed online may change as our catalogue is updated.
            If you need a particular subject, class, title or complete school
            list, send us your requirements and we will help you check the
            available selection.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/category/textbooks"
              linkLocation="subjects_hub_hero"
              contentType="textbook_collection"
              contentName="Textbook Subjects"
              className="rounded-xl bg-white px-5 py-2 font-semibold text-blue-900"
            >
              Browse All Textbooks
            </TrackedLink>

            <TrackedLink
              href="/series"
              linkLocation="subjects_hub_hero"
              contentType="textbook_series"
              contentName="Textbook Subjects"
              className="rounded-xl border border-white/60 px-5 py-2 font-semibold text-white"
            >
              Browse by Series
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="subjects_hub_hero"
              productName="Textbook Subjects"
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Ask on WhatsApp
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-5">
          <h2 className="text-2xl font-bold">Choose a Subject</h2>

          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Select a subject to browse the textbooks and learning materials
            currently represented in that subject area.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <article
              key={subject.slug}
              className="flex flex-col rounded-2xl border bg-white p-5 transition hover:bg-gray-50"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                School Subject
              </p>

              <h2 className="mt-2 text-xl font-bold text-[color:var(--text-main)]">
                {subject.name}
              </h2>

              <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                {subject.intro}
              </p>

              <TrackedLink
                href={`/subjects/${subject.slug}`}
                linkLocation="subjects_hub_collection"
                contentType="textbook_subject"
                contentName={subject.name}
                className="btn-outline mt-5 inline-flex w-full items-center justify-center px-4 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
              >
                Browse {subject.name}
              </TrackedLink>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">
            Looking for Books From a School List?
          </h2>

          <p className="mt-2 max-w-3xl text-gray-600">
            You do not have to search through every subject individually. Send
            DeeGlobalGH your school list, book titles, class or level and we can
            help you check the relevant textbooks and other school supplies
            available from our Kasoa shop.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <TrackedLink
              href="/school-list-items-kasoa"
              linkLocation="subjects_hub_footer"
              contentType="school_list"
              contentName="Textbook Subjects"
              className="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              School List Shopping
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="subjects_hub_footer"
              productName="Textbook Subjects"
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