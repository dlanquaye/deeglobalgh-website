import type { Metadata } from "next";
import TrackedLink from "@/app/components/TrackedLink";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PAGE_URL = `${SITE_URL}/jhs-textbooks-in-kasoa`;

export const metadata: Metadata = {
  title: "JHS Textbooks & JHS Books in Kasoa | DeeGlobalGH",
  description:
    "Buy JHS textbooks and JHS books in Kasoa for English, Mathematics, Science, Computing, RME, Social Studies, Career Technology and other Common Core subjects. Browse JHS school books from different educational publishers and textbook ranges available from DeeGlobalGH.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "JHS Textbooks & JHS Books in Kasoa | DeeGlobalGH",
    description:
      "Find JHS textbooks, Junior High School books and Common Core learning materials in Kasoa from DeeGlobalGH, including books from different educational publishers and textbook series.",
    url: PAGE_URL,
    siteName: "DeeGlobalGH",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JHS Textbooks & JHS Books in Kasoa | DeeGlobalGH",
    description:
      "Find JHS textbooks, JHS books and Common Core learning materials in Kasoa from DeeGlobalGH.",
  },
};

const jhsSubjects = [
  {
    name: "English",
    href: "/subjects/english",
    description: "JHS English textbooks and English Language learning materials.",
  },
  {
    name: "Mathematics",
    href: "/subjects/mathematics",
    description: "JHS Mathematics books, Maths textbooks and revision materials.",
  },
  {
    name: "Science",
    href: "/subjects/science",
    description: "JHS Science textbooks and related learning materials.",
  },
  {
    name: "Computing / ICT",
    href: "/subjects/computing",
    description: "JHS Computing books, ICT textbooks and learning materials.",
  },
  {
    name: "Religious and Moral Education",
    href: "/subjects/rme",
    description: "JHS RME textbooks and Religious and Moral Education books.",
  },
  {
    name: "Social Studies",
    href: "/subjects/social-studies",
    description: "JHS Social Studies books and learning materials.",
  },
  {
    name: "Career Technology",
    href: "/subjects/career-technology",
    description: "JHS Career Technology textbooks and learning materials.",
  },
];

const jhsSeries = [
  {
    name: "Golden Series",
    href: "/series/golden",
  },
  {
    name: "Excellence Series",
    href: "/series/excellence",
  },
  {
    name: "Essential Series",
    href: "/series/essential",
  },
  {
    name: "Best Brain Series",
    href: "/series/best-brain",
  },
  {
    name: "Don Series",
    href: "/series/don",
  },
];

export default function JhsTextbooksKasoaPage() {
  const whatsappMessage =
    "Hello DeeGlobalGH, I am looking for JHS textbooks or JHS books. Please help me check the subjects, series and titles available.";

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-6 text-white shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            Junior High School Books
          </p>

          <h1 className="text-3xl font-bold">
            JHS Textbooks and JHS Books in Kasoa
          </h1>

          <p className="mt-3 max-w-4xl text-white/90">
            Find JHS textbooks, JHS school books and Junior High School learning
            materials from DeeGlobalGH in Kasoa. We help parents, students,
            teachers and schools find books for JHS 1, JHS 2 and JHS 3 across
            subjects used in Ghana&apos;s Common Core Programme.
          </p>

          <p className="mt-3 max-w-4xl text-sm text-white/80">
            Our JHS range includes books from different educational publishers
            and textbook series. Specific subjects, editions
            and titles may vary, so contact us if you want us to confirm a
            particular book before travelling.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/textbooks-in-kasoa"
              linkLocation="jhs_textbooks_hero"
              contentType="jhs_textbook_collection"
              contentName="JHS Textbooks"
              className="rounded-xl bg-white px-5 py-2 font-semibold text-blue-900"
            >
              Browse Textbooks in Kasoa
            </TrackedLink>

            <TrackedLink
              href="/subjects"
              linkLocation="jhs_textbooks_hero"
              contentType="textbook_subject_hub"
              contentName="JHS Textbooks"
              className="rounded-xl border border-white/60 px-5 py-2 font-semibold text-white"
            >
              Browse by Subject
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233246011773?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="jhs_textbooks_hero"
              productName="JHS Textbooks"
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Ask About a JHS Book
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-blue-900">
            JHS Books by Subject
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            Browse Junior High School textbooks and JHS learning materials by
            subject. Parents may search for these as JHS books, JHS textbooks,
            Junior High School books, Common Core books or subject books, so we
            organise the range in ways that make individual subjects easier to
            find.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jhsSubjects.map((subject) => (
            <article
              key={subject.name}
              className="flex flex-col rounded-2xl border bg-white p-5"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                JHS Subject
              </p>

              <h3 className="mt-2 text-xl font-bold">{subject.name}</h3>

              <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                {subject.description}
              </p>

              <TrackedLink
                href={subject.href}
                linkLocation="jhs_subject_collection"
                contentType="jhs_subject"
                contentName={subject.name}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 font-semibold text-blue-900 hover:bg-gray-50"
              >
                Browse {subject.name}
              </TrackedLink>
            </article>
          ))}
        </div>

        <p className="mt-5 max-w-4xl text-sm text-gray-600">
          Other JHS subject areas customers may look for include Creative Arts
          and Design, French, Ghanaian Languages, Integrated Science and
          Literature-related learning materials, depending on the school,
          curriculum requirements and titles currently available. For the
          prescribed JHS literature text, you can also{" "}
          <TrackedLink
            href="/beacon-of-light-jhs-literature-ghana"
            linkLocation="jhs_subject_collection"
            contentType="jhs_literature"
            contentName="The Beacon of Light"
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            view The Beacon of Light books for JHS learners
          </TrackedLink>
          .
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            JHS Textbook Series Available From DeeGlobalGH
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            Our JHS textbook and JHS book range includes books from several
            educational series used by students and schools in Ghana. Golden
            Series, Excellence Series, Essential Series, Best Brain Series,
            Don Series and Naky Nugget Series are among the textbook series we
            supply, but they are not the full range available from DeeGlobalGH.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {jhsSeries.map((series) => (
              <TrackedLink
                key={series.name}
                href={series.href}
                linkLocation="jhs_series_collection"
                contentType="jhs_textbook_series"
                contentName={series.name}
                className="rounded-xl border bg-gray-50 px-5 py-4 font-semibold text-blue-900 hover:bg-gray-100"
              >
                {series.name}
              </TrackedLink>
            ))}
          </div>

          <TrackedWhatsAppLink
              href={`https://wa.me/233246011773?text=${encodeURIComponent(
                "Hello DeeGlobalGH, I am looking for a JHS textbook series that I did not see on the website. Please help me check whether it is available."
              )}`}
              linkLocation="jhs_series_collection"
              productName="Other JHS Textbook Series"
              className="mt-5 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300"
            >
              Enquire About Other Textbook Series
            </TrackedWhatsAppLink>

            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <p className="font-semibold text-blue-900">
                Naky Nugget Series
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Naky Nugget Series is one of the educational textbook series
                represented in our wider school-book range. For JHS, customers
                may look for titles such as Naky Nugget Series Creative Arts
                and Design, subject to current availability.
              </p>
            </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Common JHS Textbooks and Subjects We Help Parents Find
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            Customers looking for JHS books in Kasoa often ask for English
            Language, Mathematics, Science, Computing, RME, Social Studies,
            Career Technology, Creative Arts and Design, French and Ghanaian
            Language books. We also help customers check
            specific textbook series, school book lists and subject
            combinations for JHS 1, JHS 2 and JHS 3.
          </p>

          <p className="mt-3 max-w-4xl text-gray-600">
            If you are unsure of the exact title, publisher or edition, send us
            a photo of the book list or the textbook name. We can help you
            identify the correct JHS textbook before you visit our Kasoa New
            Market shop.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Buying JHS Books in Kasoa
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            DeeGlobalGH serves families looking for JHS textbooks and school
            books in Kasoa and surrounding communities. You can browse our
            online catalogue, send us your school list, ask about a particular
            JHS subject or series, and arrange collection or delivery where
            available.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/locations/kasoa-new-market"
              linkLocation="jhs_textbooks_local"
              contentType="store_location"
              contentName="Kasoa New Market Branch"
              className="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Visit Kasoa New Market Branch
            </TrackedLink>

            <TrackedLink
              href="/school-list-items-kasoa"
              linkLocation="jhs_textbooks_local"
              contentType="school_list"
              contentName="JHS Textbooks"
              className="rounded-xl border px-5 py-3 font-semibold text-blue-900 hover:bg-gray-50"
            >
              Send a School List
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233246011773?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="jhs_textbooks_local"
              productName="JHS Textbooks"
              className="rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black"
            >
              Check JHS Book Availability
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <PageJumpNav />
    </main>
  );
}