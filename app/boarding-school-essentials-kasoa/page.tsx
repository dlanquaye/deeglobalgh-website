import Link from "next/link";

export const metadata = {
  title: "Boarding School Essentials in Kasoa | SHS Supplies Ghana",
  description:
    "Shop boarding school essentials in Kasoa for SHS and other students. Find selected bedding, chop boxes, toiletries, stationery and practical school supplies at DeeGlobalGH.",
  alternates: {
    canonical:
      "https://www.shopdeeglobalgh.com/boarding-school-essentials-kasoa",
  },
};

export default function BoardingSchoolEssentialsKasoaPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4">
        Boarding School Essentials in Kasoa
      </h1>

      {/* INTRO */}
      <p className="text-gray-600 mb-6">
        Preparing for boarding school or SHS admission? DeeGlobalGH at Kasoa
        New Market helps parents, guardians and students check and prepare
        selected boarding school essentials, school supplies and practical
        student items.
      </p>

      <p className="text-gray-600 mb-8">
        Customers can send their school name, SHS prospectus or boarding list
        before visiting so we can help check availability and prepare the items
        they need. Availability varies by product.
      </p>

      {/* CTA */}
      <div className="flex gap-3 mb-10 flex-wrap">
        <a
          href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20help%20with%20a%20boarding%20school%20or%20SHS%20prospectus%20list."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
        >
          Send Your Prospectus on WhatsApp
        </a>

        <Link
  href="/boarding-school-trunks-chop-boxes-suitcases-kasoa"
  className="border px-4 py-2 rounded-xl"
>
  Suitcases, Trunks & Chop Boxes
</Link>

        <Link
          href="/school-list-items-kasoa"
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          School List Shopping
        </Link>

        <Link
  href="/shs-prospectus-shopping-kasoa"
  className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold"
>
  SHS Prospectus Shopping
</Link>

        <Link
          href="/shop"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Browse Products
        </Link>
      </div>

      {/* ESSENTIALS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Boarding School Supplies We Help Customers Prepare
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">Bedding & Dormitory Items</h3>
            <p className="text-gray-600">
              Selected mattresses, bedsheets, pillows, buckets and other
              practical dormitory items depending on current availability.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">Chop Boxes & Storage</h3>
            <p className="text-gray-600">
              Selected chop boxes and practical storage items for students
              preparing for boarding school.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">Toiletries & Personal Care</h3>
            <p className="text-gray-600">
              Selected toiletries, personal-care items and everyday student
              essentials based on the school list or prospectus.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">Stationery & Academic Supplies</h3>
            <p className="text-gray-600">
              Exercise books, pens, pencils, mathematical sets, notebooks and
              other stationery required for school.
            </p>
          </div>
        </div>
      </section>

      {/* SHS PROSPECTUS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          SHS Prospectus Shopping in Kasoa
        </h2>

        <p className="text-gray-600 mb-4">
          If you have received an SHS prospectus or school boarding list, you
          can send it to DeeGlobalGH before coming to Kasoa New Market. We can
          help you check the listed items against available stock and prepare
          the items that are available.
        </p>

        <p className="text-gray-600">
          This can help parents and guardians reduce the time spent moving from
          shop to shop while preparing for admission or school reopening.
        </p>
      </section>

      {/* SCHOOL LEVEL / REOPENING */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          School Reopening & Complete School Shopping
        </h2>

        <p className="text-gray-600 mb-4">
          DeeGlobalGH also supplies selected textbooks, stationery, exercise
          books, school bags, exam materials and other practical school items
          for students preparing for reopening.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/textbooks-in-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            Textbooks in Kasoa
          </Link>

          <Link
            href="/stationery-in-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            Stationery in Kasoa
          </Link>

          <Link
            href="/exam-materials-in-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            Exam Materials
          </Link>

          <Link
            href="/exercise-books-a4-paper-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            Exercise Books & A4 Paper
          </Link>
        </div>
      </section>

      {/* LOCAL */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Boarding School Shopping at Kasoa New Market
        </h2>

        <p className="text-gray-600">
          DeeGlobalGH serves parents, guardians, students, schools and resellers
          from Kasoa New Market. Customers can contact us before visiting to
          check selected items, prepare a school list or arrange collection or
          delivery where available.
        </p>
      </section>

      {/* TRUST */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          Why Shop Boarding Essentials with DeeGlobalGH
        </h2>

        <ul className="text-gray-600 space-y-2">
          <li>School-list and SHS prospectus shopping support</li>
          <li>Textbooks, stationery and practical student supplies</li>
          <li>Retail and selected bulk supply options</li>
          <li>Kasoa New Market collection</li>
          <li>Delivery options depending on location and order</li>
          <li>Easy enquiry through WhatsApp</li>
        </ul>
      </section>
    </div>
  );
}