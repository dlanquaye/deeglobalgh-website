import type { Metadata } from "next";
import Link from "next/link";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";
import TrackedDirectionsLink from "@/app/components/TrackedDirectionsLink";

const SITE_URL = "https://www.shopdeeglobalgh.com";
const PAGE_URL = `${SITE_URL}/locations/kasoa-new-market`;
const MAPS_URL = "https://maps.app.goo.gl/CvKUypcRP8Ybsg2a7";
const PHONE_DISPLAY = "027 003 0000";
const PHONE_E164 = "+233270030000";

export const metadata: Metadata = {
  title:
    "DeeGlobalGH Kasoa New Market | NaCCA Textbooks, Stationery & School Supplies",
  description:
    "Visit DeeGlobalGH at Kasoa New Market for NaCCA-approved and GES-recommended textbooks, Pre-School, Basic, JHS and SHS books, Cambridge and Montessori learning materials, stationery, boarding essentials and school supplies.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title:
      "DeeGlobalGH - Kasoa New Market | Textbooks, Stationery & Educational Materials",
    description:
      "Shop textbooks, stationery, educational materials, boarding essentials and school-list items at DeeGlobalGH in Kasoa New Market, including Ghana curriculum, Cambridge and Montessori learning materials.",
    url: PAGE_URL,
    siteName: "DeeGlobalGH",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const storeStructuredData = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${PAGE_URL}#store`,
  name: "DeeGlobalGH - Kasoa New Market Branch",
  url: PAGE_URL,
  telephone: PHONE_E164,
  hasMap: MAPS_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Inside Kasoa New Market, behind the lorry park, Gari Lane",
    addressLocality: "Kasoa",
    addressCountry: "GH",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "07:00",
      closes: "17:00",
    },
  ],
  areaServed: [
    {
      "@type": "City",
      name: "Kasoa",
    },
    {
      "@type": "AdministrativeArea",
      name: "Greater Accra",
    },
    {
      "@type": "Country",
      name: "Ghana",
    },
  ],
};

export default function KasoaNewMarketBranchPage() {
  const whatsappMessage = encodeURIComponent(
    "Hello DeeGlobalGH, I would like to enquire about products or directions to your Kasoa New Market Branch. Please assist me."
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeStructuredData),
        }}
      />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* BREADCRUMB */}
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-gray-500 mb-6 flex flex-wrap gap-2"
        >
          <Link href="/" className="hover:text-blue-900">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/kasoa" className="hover:text-blue-900">
            Kasoa
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Kasoa New Market Branch</span>
        </nav>

        {/* HERO */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-900 mb-2">
            DeeGlobalGH Store Location
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            DeeGlobalGH - Kasoa New Market Branch
          </h1>

          <p className="text-gray-700 max-w-4xl text-lg">
            Visit DeeGlobalGH inside Kasoa New Market for a wide range of
            textbooks, stationery, educational materials and school supplies.
            We stock many NaCCA-approved and GES-recommended textbooks for
            Pre-School (Creche, Nursery 1, Nursery 2, KG 1 and KG 2), Basic
            School, JHS and SHS, together with selected Cambridge curriculum
            textbooks, Montessori books and learning materials, boarding school
            essentials and school-list items. We are located behind the lorry
            park, around Gari Lane.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedDirectionsLink
              href={MAPS_URL}
              linkLocation="kasoa_new_market_branch_hero"
              className="bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Get Directions
            </TrackedDirectionsLink>

            <TrackedWhatsAppLink
              href={`https://wa.me/233246011773?text=${whatsappMessage}`}
              linkLocation="kasoa_new_market_branch"
              className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold"
            >
              WhatsApp Us
            </TrackedWhatsAppLink>

            <a
              href={`tel:${PHONE_E164}`}
              className="border border-blue-900 text-blue-900 px-6 py-3 rounded-xl font-semibold"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </section>

        {/* QUICK INFORMATION */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-blue-900 mb-5">
            Textbooks, stationery and educational materials in Kasoa New Market
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-5">
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-gray-600">
                Inside Kasoa New Market, behind the lorry park, around Gari
                Lane.
              </p>
            </div>

            <div className="border rounded-xl p-5">
              <h3 className="font-bold mb-2">Opening Hours</h3>
              <p className="text-gray-600">
                Monday to Saturday
                <br />
                7:00 AM - 5:00 PM
                <br />
                Sunday: Closed
              </p>
            </div>

            <div className="border rounded-xl p-5">
              <h3 className="font-bold mb-2">Shopping Options</h3>
              <p className="text-gray-600">
                Walk in and shop, order ahead for collection, or ask us about
                delivery.
              </p>
            </div>
          </div>
        </section>

        {/* SEARCHABLE SCHOOL LEVELS, BRANDS AND SERIES */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            Textbooks, stationery and educational materials for different school levels
          </h2>

          <p className="text-gray-700 max-w-4xl mb-4">
            DeeGlobalGH serves parents, students, teachers and schools looking for
            educational materials in Kasoa for Pre-School (Creche, Nursery 1,
            Nursery 2, KG 1 and KG 2), Basic School, JHS and SHS. Our range
            includes many NaCCA-approved and
            GES-recommended textbooks and learning materials used in Ghanaian schools,
            subject to current availability.
          </p>

          <p className="text-gray-700 max-w-4xl mb-6">
            We also stock curriculum-based learning materials for Ghana's
            Standards-Based Curriculum, Common Core Programme and Secondary Education
            Curriculum, together with stationery, classroom supplies, examination
            materials and practical school essentials.
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="border rounded-2xl p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Stationery and school essentials brands
              </h3>

              <p className="text-gray-600 mb-4">
                Our stationery and school essentials range includes products from
                brands such as:
              </p>

              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-gray-700">
                <li>Nataraj</li>
                <li>Deli</li>
                <li>I-Select</li>
                <li>Vneeds</li>
                <li>BIC</li>
                <li>MOTARRO</li>
                <li>Fenlot</li>
                <li>Casio</li>
                <li>Camel</li>
                <li>Camlin</li>
              </ul>

              <p className="text-sm text-gray-500 mt-4">
                Product availability varies, so contact us if you are looking for a
                particular stationery item or brand.
              </p>
            </div>

            <div className="border rounded-2xl p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Textbook series and educational book brands
              </h3>

              <p className="text-gray-600 mb-4">
                Textbook series and educational book brands available in our wider
                range include:
              </p>

              <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-2 text-gray-700">
                <li>Golden Series</li>
                <li>Wise Ant Series</li>
                <li>Excellence Series</li>
                <li>Essential Series</li>
                <li>Naky Nugget</li>
                <li>Best Brain Series</li>
                <li>Don Series</li>
                <li>Heritage Hills</li>
                <li>Ruben&apos;s Series</li>
                <li>Victory Series</li>
                <li>Kwadwoan Series</li>
                <li>Alpha Series</li>
                <li>Ahyese Series</li>
                <li>A+ Series</li>
                <li>Tamak Series</li>
                <li>Fun Series</li>
                <li>Potosky Series</li>
                <li>Active Kids</li>
                <li>Advocate Series</li>
                <li>Unique Field</li>
                <li>Masterman Series</li>
                <li>Flamingo Series</li>
                <li>Afrafra</li>
                <li>Adwinsa Series</li>
                <li>Le Fran&ccedil;ais Compr&eacute;hensif</li>
                <li>Akrong</li>
                <li>Concise</li>
                <li>Bio Series</li>
                <li>Right Hour Series</li>
                <li>Pro Quarm / Dr J. A. Quarm</li>
                <li>Ultimate Series</li>
                <li>One Touch</li>
                <li>Atta Kay</li>
                <li>EBS Series</li>
                <li>Calculus Series</li>
                <li>Baffuor Ba</li>
              </ul>

              <p className="text-sm text-gray-500 mt-4">
                Specific titles, editions and school levels vary. Contact us to confirm
                the book or series you need before travelling.
              </p>
            </div>
          </div>
        </section>

        {/* PRODUCTS AND SERVICES */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            School supplies, textbooks and stationery in Kasoa
          </h2>

          <p className="text-gray-600 max-w-3xl mb-6">
            DeeGlobalGH helps parents, students, teachers and schools find
            practical school-shopping items in Kasoa. Our range includes
            textbooks, stationery, boarding essentials, exam materials and
            other student supplies. Availability can change, so you can contact
            us before travelling if you are looking for specific items.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/textbooks-in-kasoa"
              className="border rounded-xl p-5 hover:bg-gray-50"
            >
              <h3 className="font-bold mb-2">Textbooks in Kasoa</h3>
              <p className="text-sm text-gray-600">
                Browse school textbooks by level, subject and textbook series.
              </p>
            </Link>

            <Link
              href="/stationery-in-kasoa"
              className="border rounded-xl p-5 hover:bg-gray-50"
            >
              <h3 className="font-bold mb-2">Stationery in Kasoa</h3>
              <p className="text-sm text-gray-600">
                Shop writing materials, exercise books, calculators and other
                stationery.
              </p>
            </Link>

            <Link
              href="/boarding-school-essentials-kasoa"
              className="border rounded-xl p-5 hover:bg-gray-50"
            >
              <h3 className="font-bold mb-2">Boarding School Essentials</h3>
              <p className="text-sm text-gray-600">
                Find practical boarding supplies for students preparing for
                school.
              </p>
            </Link>

            <Link
              href="/school-list-items-kasoa"
              className="border rounded-xl p-5 hover:bg-gray-50"
            >
              <h3 className="font-bold mb-2">School List Shopping</h3>
              <p className="text-sm text-gray-600">
                Send your school list and let us help you check the items we
                have available.
              </p>
            </Link>

            <Link
              href="/shs-prospectus-shopping-kasoa"
              className="border rounded-xl p-5 hover:bg-gray-50"
            >
              <h3 className="font-bold mb-2">SHS Prospectus Shopping</h3>
              <p className="text-sm text-gray-600">
                Preparing for SHS? Send your school name or prospectus before
                you come.
              </p>
            </Link>

            <Link
              href="/exam-materials-in-kasoa"
              className="border rounded-xl p-5 hover:bg-gray-50"
            >
              <h3 className="font-bold mb-2">Exam Materials</h3>
              <p className="text-sm text-gray-600">
                Find useful school and examination preparation materials.
              </p>
            </Link>
          </div>
        </section>

        {/* DIRECTIONS */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            How to find DeeGlobalGH at Kasoa New Market
          </h2>

          <p className="text-gray-600 max-w-3xl mb-6">
            We are inside Kasoa New Market, behind the lorry park around Gari
            Lane. You can also open our Google Maps location for directions.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">
                Coming from Kasoa via the Kasoa-Bawjiase Road
              </h3>

              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Take a vehicle to Kasoa New Market.</li>
                <li>Alight at the 1st Gate.</li>
                <li>
                  Enter the lorry park, where the Kuffuor buses stop.
                </li>
                <li>Turn left and walk towards the exit gate.</li>
                <li>
                  Before reaching the exit gate, look for Cheaphouse Provision
                  Shop.
                </li>
                <li>
                  When you reach Cheaphouse Provision Shop, please call
                  DeeGlobalGH directly on 027 003 0000 for the final directions
                  to the shop.
                </li>
              </ol>
            </div>

            <div className="border rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">
                Coming from Ofankor or Market Junction
              </h3>

              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>
                  Enter Kasoa New Market through the gate on your left, just
                  after Black and White Restaurant.
                </li>
                <li>
                  Ask for Psalms 23 or Cheaphouse Provision Shop.
                </li>
                <li>
                  When you reach Psalms 23 or Cheaphouse Provision Shop, please
                  call DeeGlobalGH directly on 027 003 0000 for the final
                  directions to the shop.
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-5 max-w-3xl">
            <h3 className="font-bold mb-2">Market-day contact note</h3>
            <p className="text-gray-700">
              Network coverage can sometimes be poor inside Kasoa New Market,
              especially on Tuesdays and Fridays, which are market days. If
              your call does not go through, please send us a WhatsApp message
              or SMS on {PHONE_DISPLAY}.
            </p>
          </div>

          <div className="mt-5">
            <TrackedDirectionsLink
              href={MAPS_URL}
              linkLocation="kasoa_new_market_branch_directions"
              className="inline-block bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Open DeeGlobalGH on Google Maps
            </TrackedDirectionsLink>
          </div>
        </section>

        {/* COLLECTION AND DELIVERY */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            Walk-in shopping, collection and delivery
          </h2>

          <div className="max-w-3xl space-y-4 text-gray-700">
            <p>
              Customers are welcome to walk into our Kasoa New Market Branch
              and shop directly. You can also contact us first, place an order,
              and arrange collection from the shop.
            </p>

            <p>
              We arrange delivery within Kasoa, surrounding areas and Greater
              Accra using riders. Where available, orders may be delivered on a
              cash-on-delivery basis.
            </p>

            <p>
              For nationwide delivery, packages can be sent through transport
              stations. You will first speak directly with the driver to agree
              on the transport fare. Once the fare has been confirmed and our
              staff is at the station handing the package to the driver,
              payment for the goods is made to DeeGlobalGH via MoMo before the
              package is released to the driver.
            </p>
          </div>
        </section>

        {/* PLAN BEFORE YOU COME */}
        <section className="mt-12 bg-blue-50 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            Send your school list before you come
          </h2>

          <p className="text-gray-700 max-w-3xl">
            If you are shopping for textbooks, stationery, boarding school
            items or an SHS prospectus, send us your list before travelling.
            We can help you check the items currently available and make your
            visit to Kasoa New Market easier.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <TrackedWhatsAppLink
              href={`https://wa.me/233246011773?text=${encodeURIComponent(
                "Hello DeeGlobalGH, I would like to send my school list or prospectus and check which items are available before I come to the Kasoa New Market Branch."
              )}`}
              linkLocation="kasoa_new_market_school_list"
              className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold"
            >
              Send Your List on WhatsApp
            </TrackedWhatsAppLink>

            <Link
              href="/school-list-items-kasoa"
              className="bg-white border border-blue-900 text-blue-900 px-6 py-3 rounded-xl font-semibold"
            >
              School List Shopping
            </Link>
          </div>
        </section>

        {/* LOCAL SEO FOOTER */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            Looking for a school supplies shop in Kasoa?
          </h2>

          <p className="text-gray-600 mb-4">
            DeeGlobalGH - Kasoa New Market Branch serves families, students,
            teachers and schools looking for textbooks, stationery, boarding
            school essentials and other school supplies in Kasoa.
          </p>

          <p className="text-gray-600">
            Visit us inside Kasoa New Market, behind the lorry park around Gari
            Lane, or contact us before you travel to confirm availability and
            get directions.
          </p>
        </section>

        {/* BACK TO KASOA HUB */}
        <div className="mt-10">
          <Link
            href="/kasoa"
            className="font-semibold text-blue-900 hover:underline"
          >
            Explore more DeeGlobalGH school shopping options in Kasoa
          </Link>
        </div>
      </main>
    </>
  );
}

