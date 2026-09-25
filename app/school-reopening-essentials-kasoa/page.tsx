import Link from "next/link";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";

export const metadata = {
  title: "School Reopening Essentials in Kasoa | Back to School Ghana",
  description:
    "Shop school reopening essentials in Kasoa including textbooks, stationery, exercise books, school bags, A4 paper, boarding items and practical student supplies from DeeGlobalGH.",
  alternates: {
    canonical:
      "https://www.shopdeeglobalgh.com/school-reopening-essentials-kasoa",
  },
};

export default function SchoolReopeningEssentialsKasoaPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          School Reopening Essentials in Kasoa
        </h1>

        <p className="text-lg text-gray-700 mb-5">
          Preparing for school reopening in Kasoa? DeeGlobalGH helps parents,
          guardians, students, teachers and schools find many of the everyday
          items needed for a smoother return to school.
        </p>

        <p className="text-gray-700 mb-6">
          From textbooks and stationery to exercise books, school bags,
          boarding essentials and practical student supplies, you can send us
          your school list or enquiry and we will help you check what is
          available.
        </p>

        <div className="flex flex-wrap gap-3">
          <TrackedWhatsAppLink
  href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20need%20help%20with%20school%20reopening%20shopping."
  linkLocation="school_reopening_essentials"
  className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
>
  Send Your School List
</TrackedWhatsAppLink>

          <Link
            href="/shop"
            className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            Browse the Shop
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-5">
          Back-to-School Shopping in One Place
        </h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">Textbooks</h3>
            <p className="text-gray-700">
              Textbooks and educational books for preschool, primary, JHS and
              SHS, depending on current availability.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">
              Stationery & Academic Supplies
            </h3>
            <p className="text-gray-700">
              Pens, pencils, rulers, mathematical sets, notebooks, graph books,
              exercise books and other classroom supplies.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">Exercise Books</h3>
            <p className="text-gray-700">
              Exercise books for students, schools and bulk buyers, including
              options for retail and wholesale enquiries.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">A4 Paper</h3>
            <p className="text-gray-700">
              A4 paper for school, office, printing and bulk supply enquiries,
              subject to stock availability.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">
              School Bags & Practical Supplies
            </h3>
            <p className="text-gray-700">
              School bags and useful everyday student supplies for reopening
              preparation.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">
              Boarding School Essentials
            </h3>
            <p className="text-gray-700">
              Selected bedding, storage, toiletries, stationery and practical
              boarding-school items for SHS preparation.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-5">
          School Reopening Checklist
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Books & Learning Materials</h3>
            <ul className="space-y-2 text-gray-700">
              <li>Textbooks</li>
              <li>Revision and exam materials</li>
              <li>Exercise books</li>
              <li>Notebooks</li>
              <li>Graph books</li>
              <li>Official ruled lines where required</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Writing & Classroom Supplies</h3>
            <ul className="space-y-2 text-gray-700">
              <li>Pens</li>
              <li>Pencils</li>
              <li>Erasers</li>
              <li>Sharpeners</li>
              <li>Rulers</li>
              <li>Mathematical sets</li>
              <li>Scientific calculators where required</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Practical Student Supplies</h3>
            <ul className="space-y-2 text-gray-700">
              <li>School bags</li>
              <li>Water bottles</li>
              <li>Lunch and food containers where suitable</li>
              <li>Personal storage items</li>
              <li>Labelling materials</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Boarding Preparation</h3>
            <ul className="space-y-2 text-gray-700">
              <li>Suitcases, trunks, chop boxes and storage</li>
              <li>Mattresses and selected bedding</li>
              <li>Toiletries and personal-care items</li>
              <li>Laundry items</li>
              <li>Academic backups</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 border rounded-2xl p-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">
          Have a School List? Send It Before You Come
        </h2>

        <p className="text-gray-700 mb-4">
          If your school has provided a book list, stationery list, prospectus
          or reopening list, you can send it to DeeGlobalGH before visiting.
          This helps us check the items we currently have and prepare your
          shopping more efficiently.
        </p>

        <p className="text-gray-700">
          Availability can vary by item, brand, size and school requirement, so
          please confirm before travelling when you need specific products.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          School Supplies in Kasoa New Market
        </h2>

        <p className="text-gray-700 mb-4">
          DeeGlobalGH serves customers from Kasoa New Market and surrounding
          areas looking for school supplies, books, stationery, reopening
          essentials and school-list support.
        </p>

        <p className="text-gray-700">
          Retail, wholesale, collection and delivery enquiries are welcome,
          depending on the products required and current availability.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Related School Shopping Guides
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/school-list-items-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            School List Shopping
          </Link>

          <Link
            href="/boarding-school-essentials-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            Boarding School Essentials
          </Link>

          <Link
            href="/shs-prospectus-shopping-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            SHS Prospectus Shopping
          </Link>

          <Link
            href="/shs-commonly-forgotten-items-checklist"
            className="border px-4 py-2 rounded-xl"
          >
            Commonly Forgotten SHS Items
          </Link>

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
            href="/exercise-books-a4-paper-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            Exercise Books & A4 Paper
          </Link>
        </div>
      </section>

      <section className="border-t pt-6">
        <p className="text-sm text-gray-600">
          Product availability changes. DeeGlobalGH does not guarantee that
          every item listed on this page is always in stock. Contact us to
          confirm specific items before visiting or placing an order.
        </p>
      </section>
    </div>
  );
}