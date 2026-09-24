import Link from "next/link";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";

export const metadata = {
  title: "SHS Prospectus Shopping in Kasoa | School List Help Ghana",
  description:
    "Send your SHS prospectus or school list to DeeGlobalGH in Kasoa for help checking and preparing available boarding essentials, stationery, textbooks and student supplies.",
  alternates: {
    canonical:
      "https://www.shopdeeglobalgh.com/shs-prospectus-shopping-kasoa",
  },
};

export default function ShsProspectusShoppingKasoaPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4">
        SHS Prospectus Shopping in Kasoa
      </h1>

      {/* INTRO */}
      <p className="text-gray-600 mb-6">
        Received your SHS placement, prospectus or boarding list? DeeGlobalGH
        at Kasoa New Market helps parents, guardians and students check and
        prepare available school items before admission or reopening.
      </p>

      <p className="text-gray-600 mb-8">
        Send us your school name, prospectus or list on WhatsApp and we can help
        you check the items against available stock. Availability varies by
        product, school requirements and quantity.
      </p>

      {/* CTA */}
      <div className="flex gap-3 mb-10 flex-wrap">
        <TrackedWhatsAppLink
  href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20help%20checking%20an%20SHS%20prospectus%20or%20school%20list."
  linkLocation="shs_prospectus_shopping"
  className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
>
  Send Your SHS Prospectus
</TrackedWhatsAppLink>

        <Link
          href="/boarding-school-essentials-kasoa"
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          View Boarding Essentials
        </Link>

        <Link
          href="/shop"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Browse Products
        </Link>
      </div>

      {/* HOW IT WORKS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          How SHS Prospectus Shopping Works
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">1. Send Your List</h3>
            <p className="text-gray-600">
              Send the school name, prospectus, photo or school list through
              WhatsApp.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">2. We Check Availability</h3>
            <p className="text-gray-600">
              We help check which listed textbooks, stationery, boarding items
              and practical supplies are currently available.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">3. Prepare Your Order</h3>
            <p className="text-gray-600">
              Available items can be prepared for collection or delivery where
              applicable.
            </p>
          </div>
        </div>
      </section>

      {/* ITEMS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Items Commonly Found on SHS Prospectus Lists
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">
              Boarding & Dormitory Essentials
            </h3>
            <p className="text-gray-600">
              Selected bedding, mattresses, chop boxes, buckets, toiletries,
              personal-care items and other practical boarding supplies.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">
              Stationery & Writing Materials
            </h3>
            <p className="text-gray-600">
              Exercise books, notebooks, pens, pencils, mathematical sets,
              rulers and other academic supplies.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">
              Textbooks & Learning Materials
            </h3>
            <p className="text-gray-600">
              Selected SHS textbooks, revision materials and other learning
              resources depending on the school list and current stock.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold mb-2">
              Practical Student Supplies
            </h3>
            <p className="text-gray-600">
              Selected school bags, personal items and other practical student
              requirements included on individual prospectus lists.
            </p>
          </div>
        </div>
      </section>

      {/* KASOA */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Prepare Your SHS Prospectus in Kasoa
        </h2>

        <p className="text-gray-600 mb-4">
          DeeGlobalGH serves customers from Kasoa New Market and surrounding
          areas. Sending your list before visiting allows us to help check
          availability and prepare what we can before you come.
        </p>

        <p className="text-gray-600">
          Customers outside Kasoa can also contact us to discuss available
          collection or delivery options.
        </p>
      </section>

      {/* RELATED SHOPPING */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Complete School Shopping in Kasoa
        </h2>

        <div className="flex flex-wrap gap-3">
            <Link
  href="/ges-harmonised-shs-prospectus-2026-2027"
  className="border px-4 py-2 rounded-xl"
>
  2026/2027 GES Prospectus Checklist
</Link>

          <Link
            href="/boarding-school-essentials-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            Boarding School Essentials
          </Link>

          <Link
            href="/school-list-items-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            School List Items
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
            href="/exam-materials-in-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            Exam Materials
          </Link>
        </div>
      </section>

      {/* TRUST */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          Why Send Your Prospectus to DeeGlobalGH
        </h2>

        <ul className="text-gray-600 space-y-2">
          <li>SHS prospectus and school-list shopping support</li>
          <li>Boarding, stationery and academic supplies in one place</li>
          <li>Kasoa New Market collection</li>
          <li>Delivery options depending on location and order</li>
          <li>WhatsApp enquiry before visiting</li>
          <li>No assumption that every prospectus item is always in stock</li>
        </ul>
      </section>
    </div>
  );
}