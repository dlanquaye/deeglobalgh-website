import Link from "next/link";

export const metadata = {
  title: "School List Items in Kasoa | Back to School Supplies Ghana",
  description:
    "Find complete school list items in Kasoa for Pre-School, Basic, JHS, and SHS. Order textbooks, stationery, and essentials with fast delivery.",
  alternates: {
    canonical: "https://www.shopdeeglobalgh.com/school-list-items-kasoa",
  },
};

export default function SchoolListPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4">
        School List Items in Kasoa – Complete Back-to-School Guide
      </h1>

      {/* INTRO */}
      <p className="text-gray-600 mb-6">
        Looking for complete school list items in Kasoa? DeeglobalGh helps parents,
        students, and schools get textbooks, stationery, and essentials in one place.
        We offer fast delivery and easy ordering through WhatsApp.
      </p>

      {/* CTA */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <a
  href="https://wa.me/233270030000"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
>
  Order Full School List on WhatsApp
</a>

        <Link
          href="/shop"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Browse All Products
        </Link>

        
      </div>

<Link
  href="/school-list-items-kasoa"
  className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
>
  View Full School List
</Link>

      {/* SCHOOL LEVELS */}
      <h2 className="text-xl font-bold mb-4">
        School Items by Level
      </h2>

      <div className="space-y-6">

        <div>
          <Link href="/shop?level=pre-school" className="font-semibold text-blue-900 hover:underline">
  Pre-School →
</Link>
          <p className="text-gray-600">
            Crayons, pencils, drawing books, erasers, and basic learning materials.
          </p>
        </div>

        <div>
          <Link href="/shop?level=basic-1" className="font-semibold text-blue-900 hover:underline">
  Basic 1 – Basic 6 →
</Link>
          <p className="text-gray-600">
            Exercise books, pencils, rulers, erasers, approved textbooks, and school supplies.
          </p>
          
        </div>

        <div>
          <Link href="/shop?level=jhs" className="font-semibold text-blue-900 hover:underline">
  JHS →
</Link>
          <p className="text-gray-600">
            Maths sets, pens, pencils, exam materials, and subject textbooks.
          </p>
        </div>

        <div>
          <Link href="/shop?level=shs" className="font-semibold text-blue-900 hover:underline">
  SHS →
</Link>
          <p className="text-gray-600">
            Scientific calculators, textbooks, dormitory essentials, and advanced stationery.
          </p>
        </div>

      </div>

      {/* INTERNAL LINKS */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          Shop by Category
        </h2>

        <div className="flex flex-wrap gap-3">

          <Link href="/textbooks-in-kasoa" className="border px-4 py-2 rounded-xl">
            Textbooks in Kasoa
          </Link>

          <Link href="/stationery-in-kasoa" className="border px-4 py-2 rounded-xl">
            Stationery in Kasoa
          </Link>

          <Link href="/exam-materials-in-kasoa" className="border px-4 py-2 rounded-xl">
            Exam Materials
          </Link>

        </div>
      </div>

      {/* TRUST */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          Why Choose DeeglobalGh
        </h2>

        <ul className="text-gray-600 space-y-2">
          <li>Fast delivery across Kasoa</li>
          <li>Genuine and approved textbooks</li>
          <li>Everything in one place</li>
          <li>Easy ordering through WhatsApp</li>
        </ul>
      </div>

    </div>
  );
}