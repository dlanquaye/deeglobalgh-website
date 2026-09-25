import Link from "next/link";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";

export const metadata = {
  title: "Suitcases, Trunks & Chop Boxes in Kasoa | Boarding School Ghana",
  description:
    "Find boarding school suitcases, trunks, chop boxes and storage options in Kasoa from DeeGlobalGH. Ideal for SHS boarding preparation, school reopening and prospectus shopping.",
  alternates: {
    canonical:
      "https://www.shopdeeglobalgh.com/boarding-school-trunks-chop-boxes-suitcases-kasoa",
  },
};

export default function BoardingStorageKasoaPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Suitcases, Trunks & Chop Boxes in Kasoa
        </h1>

        <p className="text-lg text-gray-700 mb-5">
          Preparing a student for boarding school or SHS reopening? DeeGlobalGH
          supplies suitcases, trunks, chop boxes and practical storage options
          for school preparation in Kasoa.
        </p>

        <p className="text-gray-700 mb-6">
          These items are useful for storing clothes, personal belongings,
          toiletries, books and other boarding essentials. Available options can
          vary by size, design and current stock, so contact us before visiting
          if you need something specific.
        </p>

        <div className="flex flex-wrap gap-3">
          <TrackedWhatsAppLink
  href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20want%20to%20check%20available%20suitcases%2C%20trunks%20and%20chop%20boxes%20for%20boarding%20school."
  linkLocation="boarding_trunks_suitcases"
  className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
>
  Check Available Options
</TrackedWhatsAppLink>

          <Link
            href="/boarding-school-essentials-kasoa"
            className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            View Boarding School Essentials
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-5">
          Boarding School Storage Options
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">Suitcases</h3>
            <p className="text-gray-700">
              Practical luggage for carrying and storing clothes, personal
              belongings and school items during boarding-school reporting and
              reopening.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">School Trunks</h3>
            <p className="text-gray-700">
              Strong storage trunks suitable for boarding-school preparation,
              depending on the size and type required by the student or school.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">Chop Boxes</h3>
            <p className="text-gray-700">
              Chop boxes for storing food-related items, provisions and other
              permitted boarding-school supplies where required.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-5">
          What to Check Before Buying
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">School Requirements</h3>
            <p className="text-gray-700">
              Some schools may specify particular colours, sizes, materials or
              storage types. Always check the school prospectus or confirm with
              the school before buying.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Size & Capacity</h3>
            <p className="text-gray-700">
              Consider what the student needs to carry and store, including
              clothing, toiletries, books and other boarding items.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Durability</h3>
            <p className="text-gray-700">
              Choose an option suitable for repeated school use and transport,
              particularly when the item will be moved between home and school.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Current Availability</h3>
            <p className="text-gray-700">
              Sizes, designs and colours can change, so contact DeeGlobalGH if
              you want us to check what is currently available before you come.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10 border rounded-2xl p-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">
          Preparing a Full Boarding School List?
        </h2>

        <p className="text-gray-700 mb-4">
          Suitcases, trunks and chop boxes are only part of boarding-school
          preparation. DeeGlobalGH can also help you check selected bedding,
          mattresses, toiletries, stationery, academic supplies and other
          practical boarding items.
        </p>

        <p className="text-gray-700">
          Send your school prospectus or boarding list before visiting and we
          can help you check what is currently available.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Boarding School Shopping in Kasoa
        </h2>

        <p className="text-gray-700 mb-4">
          DeeGlobalGH serves parents, guardians and students shopping for SHS
          boarding and school-reopening items in and around Kasoa.
        </p>

        <p className="text-gray-700">
          Visit us at Kasoa New Market or contact us first if you want to check
          specific items before travelling.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Related Boarding School Guides
        </h2>

        <div className="flex flex-wrap gap-3">
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
            href="/ges-harmonised-shs-prospectus-2026-2027"
            className="border px-4 py-2 rounded-xl"
          >
            GES SHS Prospectus Checklist
          </Link>

          <Link
            href="/school-reopening-essentials-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            School Reopening Essentials
          </Link>

          <Link
            href="/shs-commonly-forgotten-items-checklist"
            className="border px-4 py-2 rounded-xl"
          >
            Commonly Forgotten SHS Items
          </Link>
        </div>
      </section>

      <section className="border-t pt-6">
        <p className="text-sm text-gray-600">
          Product sizes, colours, designs and availability may change.
          DeeGlobalGH does not guarantee that every suitcase, trunk or chop box
          type is always in stock. Contact us to confirm specific requirements
          before visiting.
        </p>
      </section>
    </div>
  );
}