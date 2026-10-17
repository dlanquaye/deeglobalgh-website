import type { Metadata } from "next";
import TrackedLink from "@/app/components/TrackedLink";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import PageJumpNav from "@/app/components/PageJumpNav";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PAGE_URL = `${SITE_URL}/shs-textbooks-in-kasoa`;

export const metadata: Metadata = {
  title: "SHS Textbooks & SHS Books in Kasoa | DeeGlobalGH",
  description:
    "Find SHS textbooks and SHS books in Kasoa for Mathematics, Additional Mathematics, English, Biology, Chemistry, Physics, General Science, Economics, Geography, Government, Social Studies and more.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "SHS Textbooks & SHS Books in Kasoa | DeeGlobalGH",
    description:
      "Browse Senior High School books and SHS textbooks in Kasoa, including Wise Ant, Prof Quarm, Baffour-Ba, Concise, Atta Kay, Akrong and other popular school books.",
    url: PAGE_URL,
    siteName: "DeeGlobalGH",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SHS Textbooks & SHS Books in Kasoa | DeeGlobalGH",
    description:
      "Find SHS textbooks, SHS books and Senior High School learning materials in Kasoa from DeeGlobalGH.",
  },
};

const linkedSubjects = [
  {
    name: "English Language",
    href: "/subjects/english",
    description:
      "SHS English textbooks, English Language books and learning materials.",
  },
  {
    name: "Mathematics",
    href: "/subjects/mathematics",
    description:
      "SHS Mathematics textbooks, General Mathematics books and related learning materials.",
  },
  {
    name: "Computing",
    href: "/subjects/computing",
    description:
      "SHS Computing textbooks, ICT books and related learning materials.",
  },
  {
    name: "Social Studies",
    href: "/subjects/social-studies",
    description:
      "SHS Social Studies textbooks, school books and learning materials.",
  },
  {
    name: "Economics",
    href: "/subjects/economics",
    description:
      "SHS Economics textbooks and related learning materials.",
  },
  {
    name: "Physics",
    href: "/conquering-physics-shs-textbook-ghana",
    description:
      "SHS Physics textbooks and Physics learning materials, including Conquering Physics for SHS 1-3.",
  },
];

const additionalSubjects = [
  "Additional Mathematics",
  "Biology",
  "Chemistry",
  "General Science",
  "Physics",
  "Food & Nutrition",
  "Management in Living",
  "Geography",
  "Government",
  "CRS",
];

const popularShsBooks = [
  {
    title: "Baffour-Ba Series Mathematics",
    subject: "Mathematics",
    price: 200,
  },
  {
    title: "Baffour-Ba Series Additional Mathematics",
    subject: "Additional Mathematics",
    price: 200,
  },
  {
    title: "Concise General Mathematics",
    subject: "Mathematics",
    price: 200,
  },
  {
    title: "Concise Additional Mathematics",
    subject: "Additional Mathematics",
    price: 200,
  },
  {
    title: "A1 Series College Biology",
    subject: "Biology",
    price: 250,
  },
  {
    title: "CrossPower Past Questions and Answers for SHS - CRS",
    subject: "CRS",
    price: 100,
  },
  {
    title: "Prof Quarm Social Studies",
    subject: "Social Studies",
    price: 200,
  },
  {
    title: "Prof Quarm Mathematics",
    subject: "Mathematics",
    price: 250,
  },
  {
    title: "Prof Quarm General Science",
    subject: "General Science",
    price: 200,
  },
  {
    title: "Prof Quarm English",
    subject: "English Language",
    price: 200,
  },
  {
    title: "Atta Kay Physics Book 1",
    subject: "Physics",
    price: 130,
  },
  {
    title: "Atta Kay Physics Book 2",
    subject: "Physics",
    price: 130,
  },
  {
    title: "X Coco Series Understanding Chemistry",
    subject: "Chemistry",
    price: 170,
  },
  {
    title: "Prof & Figures Simplified Economics",
    subject: "Economics",
    price: 120,
  },
  {
    title: "One Touch Government for Senior High Schools",
    subject: "Government",
    price: 180,
  },
  {
    title: "Akrong Series Add Mathematics",
    subject: "Additional Mathematics",
    price: 200,
  },
  {
    title: "Akrong Series Mathematics",
    subject: "Mathematics",
    price: 200,
  },
  {
    title: "Kov's Series The Ultimate Chemistry",
    subject: "Chemistry",
    price: 170,
  },
  {
    title: "Right Hour Series Geography",
    subject: "Geography",
    price: 200,
  },
  {
    title: "Adwinsa Series Conquering Physics",
    subject: "Physics",
    price: 300,
  },
];

export default function ShsTextbooksKasoaPage() {
  const whatsappMessage =
    "Hello DeeGlobalGH, I am looking for SHS textbooks or SHS books. Please help me check the subjects, titles and textbook series available.";

  const otherSeriesMessage =
    "Hello DeeGlobalGH, I am looking for an SHS textbook series or title that I did not see on the website. Please help me check whether it is available.";

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 p-6 text-white shadow-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
            Senior High School Books
          </p>

          <h1 className="text-3xl font-bold">
            SHS Textbooks and SHS Books in Kasoa
          </h1>

          <p className="mt-3 max-w-4xl text-white/90">
            Find SHS textbooks, SHS school books and Senior High School learning
            materials from DeeGlobalGH in Kasoa. We help students, parents,
            teachers and schools find books for SHS 1, SHS 2 and SHS 3 across
            subjects used under Ghana&apos;s Secondary Education Curriculum.
          </p>

          <p className="mt-3 max-w-4xl text-sm text-white/80">
            Our SHS range includes core and subject-specific books from several
            educational publishers and textbook series. Specific titles,
            editions and current availability may vary, so contact us if you
            want us to confirm a particular SHS book before travelling.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/textbooks-in-kasoa"
              linkLocation="shs_textbooks_hero"
              contentType="shs_textbook_collection"
              contentName="SHS Textbooks"
              className="rounded-xl bg-white px-5 py-2 font-semibold text-blue-900"
            >
              Browse Textbooks in Kasoa
            </TrackedLink>

            <TrackedLink
              href="/subjects"
              linkLocation="shs_textbooks_hero"
              contentType="textbook_subject_hub"
              contentName="SHS Textbooks"
              className="rounded-xl border border-white/60 px-5 py-2 font-semibold text-white"
            >
              Browse by Subject
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="shs_textbooks_hero"
              productName="SHS Textbooks"
              className="rounded-xl bg-yellow-400 px-5 py-2 font-semibold text-black"
            >
              Ask About an SHS Book
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-blue-900">
            SHS Books by Subject
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            Customers may search for these as SHS books, SHS textbooks, Senior
            High School books, SHS subject books or Secondary Education
            Curriculum textbooks. Browse the subject areas currently
            represented in our wider SHS textbook range.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {linkedSubjects.map((subject) => (
            <article
              key={subject.name}
              className="flex flex-col rounded-2xl border bg-white p-5"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                SHS Subject
              </p>

              <h3 className="mt-2 text-xl font-bold">{subject.name}</h3>

              <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                {subject.description}
              </p>

              <TrackedLink
                href={subject.href}
                linkLocation="shs_subject_collection"
                contentType="shs_subject"
                contentName={subject.name}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 font-semibold text-blue-900 hover:bg-gray-50"
              >
                Browse {subject.name}
              </TrackedLink>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border bg-white p-5">
          <h3 className="text-lg font-bold text-blue-900">
            More SHS Subjects
          </h3>

          <p className="mt-2 text-gray-600">
            Our SHS textbook range also includes subject areas such as{" "}
            {additionalSubjects.join(", ")}. Some subject pages are not yet
            separately displayed online, so contact us to check the exact title
            or edition you need.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Popular SHS Books Customers Ask for in Kasoa
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            These are among the SHS textbooks and Senior High School books
            customers have been asking for and buying from DeeGlobalGH. This is
            not our complete SHS range, and availability can change as books
            are sold and restocked.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularShsBooks.map((book) => (
              <article
                key={book.title}
                className="rounded-2xl border bg-gray-50 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {book.subject}
                </p>

                <h3 className="mt-2 font-bold text-gray-900">
                  {book.title === "Adwinsa Series Conquering Physics" ? (
                    <TrackedLink
                      href="/conquering-physics-shs-textbook-ghana"
                      linkLocation="shs_popular_books"
                      contentType="shs_textbook"
                      contentName="Conquering Physics SHS 1-3"
                      className="hover:text-blue-800 hover:underline"
                    >
                      {book.title}
                    </TrackedLink>
                  ) : (
                    book.title
                  )}
                </h3>

                <p className="mt-3 text-lg font-bold text-blue-900">
                  GH&#8373;{book.price}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Subject to current availability.
                </p>
              </article>
            ))}
          </div>

          <TrackedWhatsAppLink
            href={`https://wa.me/233270030000?text=${encodeURIComponent(
              "Hello DeeGlobalGH, I would like to check the availability of an SHS book I saw on your website."
            )}`}
            linkLocation="shs_popular_books"
            productName="Popular SHS Books"
            className="mt-6 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300"
          >
            Check a Book on WhatsApp
          </TrackedWhatsAppLink>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Wise Ant SHS Textbooks
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            Wise Ant Series is among the SHS textbook ranges available from
            DeeGlobalGH. Our confirmed Wise Ant SHS range covers several
            subjects, including Biology, Chemistry, Computing, Economics,
            English, General Science, Mathematics, Physics, Social Studies,
            Food & Nutrition and Management in Living.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/series/wise-ant"
              linkLocation="shs_series_collection"
              contentType="shs_textbook_series"
              contentName="Wise Ant Series"
              className="rounded-xl border bg-gray-50 px-5 py-3 font-semibold text-blue-900 hover:bg-gray-100"
            >
              Browse Wise Ant Series
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                otherSeriesMessage
              )}`}
              linkLocation="shs_series_collection"
              productName="Other SHS Textbook Series"
              className="rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black hover:bg-yellow-300"
            >
              Enquire About Other SHS Series
            </TrackedWhatsAppLink>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Individual SHS titles and editions may not all be displayed online
            at the same time. Contact us for current availability before
            travelling if you need a particular book.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            SHS Textbook Series and Popular Book Ranges
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            In addition to Wise Ant, customers ask us for SHS books and
            educational ranges such as Baffour-Ba Series, Concise, A1 Series,
            Prof Quarm, Atta Kay, X Coco Series, One Touch, Akrong Series,
            Kov&apos;s Series, Right Hour Series and Adwinsa Series. These are
            among the names represented in our current SHS range and should not
            be treated as the complete list of books we may carry.
          </p>

          <TrackedWhatsAppLink
            href={`https://wa.me/233270030000?text=${encodeURIComponent(
              otherSeriesMessage
            )}`}
            linkLocation="shs_other_ranges"
            productName="Other SHS Book Ranges"
            className="mt-5 inline-flex rounded-xl border border-yellow-500 bg-yellow-50 px-5 py-3 font-semibold text-black hover:bg-yellow-100"
          >
            Enquire About Another SHS Book or Series
          </TrackedWhatsAppLink>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Common SHS Subjects We Help Students Find
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            Students and parents looking for SHS books in Kasoa ask for English
            Language, Mathematics, Additional Mathematics, General Science,
            Biology, Chemistry, Physics, Computing, Social Studies, Economics,
            Geography, Government, CRS, Food & Nutrition and Management in
            Living. We can also help check school book lists and specific
            textbook titles for SHS 1, SHS 2 and SHS 3.
          </p>

          <p className="mt-3 max-w-4xl text-gray-600">
            If you are unsure of the exact title, publisher or edition, send us
            the book name or a photo of the school list. We can help check the
            required SHS textbook before you visit our Kasoa New Market shop.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            SHS Prospectus and School-List Shopping
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            If you are preparing for Senior High School admission or reopening,
            you do not have to search for textbooks separately from the rest of
            your school requirements. Send DeeGlobalGH your SHS prospectus or
            school list and we can help you check available textbooks,
            stationery, boarding essentials and other student supplies.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedLink
              href="/shs-prospectus-shopping-kasoa"
              linkLocation="shs_textbooks_prospectus"
              contentType="shs_prospectus"
              contentName="SHS Textbooks"
              className="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              SHS Prospectus Shopping
            </TrackedLink>

            <TrackedLink
              href="/ges-harmonised-shs-prospectus-2026-2027"
              linkLocation="shs_textbooks_prospectus"
              contentType="shs_prospectus_checklist"
              contentName="SHS Textbooks"
              className="rounded-xl border px-5 py-3 font-semibold text-blue-900 hover:bg-gray-50"
            >
              2026/2027 SHS Prospectus
            </TrackedLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233270030000?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              linkLocation="shs_textbooks_prospectus"
              productName="SHS Textbooks"
              className="rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black"
            >
              Check SHS Book Availability
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Buying SHS Books in Kasoa
          </h2>

          <p className="mt-2 max-w-4xl text-gray-600">
            DeeGlobalGH serves students, parents and schools looking for SHS
            textbooks and Senior High School books in Kasoa and surrounding
            communities. You can enquire about a subject or title before
            travelling, collect available books from our Kasoa New Market shop,
            or discuss delivery options where applicable.
          </p>

          <div className="mt-5">
            <TrackedLink
              href="/locations/kasoa-new-market"
              linkLocation="shs_textbooks_local"
              contentType="store_location"
              contentName="Kasoa New Market Branch"
              className="inline-flex rounded-xl border px-5 py-3 font-semibold text-blue-900 hover:bg-gray-50"
            >
              Visit Kasoa New Market Branch
            </TrackedLink>
          </div>
        </div>
      </section>

      <PageJumpNav />
    </main>
  );
}