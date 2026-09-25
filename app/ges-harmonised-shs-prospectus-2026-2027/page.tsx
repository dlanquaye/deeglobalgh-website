import Link from "next/link";
import TrackedWhatsAppLink from "@/app/components/TrackedWhatsAppLink";

export const metadata = {
  title: "GES SHS Prospectus 2026/2027 Checklist | Ghana",
  description:
    "Practical checklist based on the 2026/2027 GES National Harmonised Prospectus for SHS and SHTS boarding and day students in Ghana. Confirm school-specific requirements before buying.",
  alternates: {
    canonical:
      "https://www.shopdeeglobalgh.com/ges-harmonised-shs-prospectus-2026-2027",
  },
};

export default function GesHarmonisedProspectusPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">
        2026/2027 GES Harmonised SHS Prospectus Checklist
      </h1>

      <p className="text-gray-600 mb-6">
        The Ghana Education Service released a National Harmonised Prospectus
        for prospective SHS and SHTS students for the 2026/2027 academic year.
        This DeeGlobalGH page is provided as a practical shopping checklist to
        help parents, guardians and students prepare.
      </p>

      {/* IMPORTANT WARNING */}
      <section className="border-2 border-red-500 bg-red-50 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-bold text-red-800 mb-3">
          Important: Please Read Before Buying
        </h2>

        <p className="text-red-900 font-semibold mb-3">
          This page is only a checklist. It is not a replacement for the final
          prospectus or instructions from the specific school your child has
          been placed in.
        </p>

        <p className="text-red-900 mb-3">
          Parents and students must contact or visit the assigned SHS or SHTS
          to confirm school-specific requirements, including colours, styles,
          quantities and any other details that may apply to that school.
        </p>

        <p className="text-red-900 font-bold">
          For the grouped school-use items, do not buy items from Group 1,
          Group 2 and Group 3 together. Ask the school which group the student
          has been assigned to, and buy only the items required for that
          assigned group.
        </p>
      </section>

      {/* CTA */}
      <div className="flex flex-wrap gap-3 mb-10">
        <TrackedWhatsAppLink
  href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20help%20checking%20an%20SHS%20prospectus%20list."
  linkLocation="ges_harmonised_prospectus"
  className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
>
  Send Your Prospectus on WhatsApp
</TrackedWhatsAppLink>

        <Link
          href="/shs-prospectus-shopping-kasoa"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          SHS Prospectus Shopping in Kasoa
        </Link>

        <Link
          href="/boarding-school-essentials-kasoa"
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Boarding School Essentials
        </Link>
      </div>

      {/* BOARDING */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Boarding Student Checklist
        </h2>

        <p className="text-gray-600 mb-5">
          The harmonised prospectus includes personal, academic, dormitory and
          school-use items for boarding students. Confirm all school-specific
          details before purchasing.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Storage & Dormitory</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Hard-body suitcase or trunk</li>
              <li>Wooden or plastic chop box</li>
              <li>Student mattress</li>
              <li>Pillow</li>
              <li>Two bedsheets and pillowcases</li>
              <li>Blanket and sleeping cloth</li>
              <li>Mosquito net</li>
              <li>Bucket with cover and pail</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Eating & Personal Care</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Drinking cup</li>
              <li>Plate and cutlery</li>
              <li>Toothbrush and toothpaste</li>
              <li>Soap and pomade</li>
              <li>Deodorant</li>
              <li>Toilet roll</li>
              <li>Sanitary pads for girls</li>
              <li>Mosquito repellent</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Clothing & Footwear</h3>
            <ul className="text-gray-700 space-y-2">
              <li>School-specific sandals</li>
              <li>School-specific leather slippers</li>
              <li>Black or white sneakers</li>
              <li>School-specific socks</li>
              <li>Sleepwear</li>
              <li>Underwear</li>
              <li>White shirts and school-specific clothing</li>
              <li>School-specific shoes and belt</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Academic & Other Items</h3>
            <ul className="text-gray-700 space-y-2">
              <li>School bag</li>
              <li>Mathematical set</li>
              <li>Scientific calculator</li>
              <li>Bible, Quran or hymn book where applicable</li>
              <li>Hoe or cutlass where required</li>
              <li>Other school-specific items</li>
            </ul>
          </div>
        </div>
      </section>

      {/* GROUP WARNING */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          School-Use Groups: Buy Only Your Assigned Group
        </h2>

        <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-5 mb-6">
          <p className="font-bold text-amber-900">
            Do not purchase all three groups. Confirm the student's assigned
            group with the school first.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Group 1</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Hard hand gloves</li>
              <li>5 litres liquid soap</li>
              <li>1 kg washing powder</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Group 2</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Small bleach</li>
              <li>Dustpan</li>
              <li>Long-handle broom</li>
              <li>Scrubbing brush</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Group 3</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Standing mop and mop bucket</li>
              <li>Duster</li>
              <li>Short local broom</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DAY STUDENTS */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Day Student Checklist
        </h2>

        <div className="border rounded-xl p-5 bg-white">
          <ul className="text-gray-700 space-y-2">
            <li>Mathematical set</li>
            <li>Scientific calculator</li>
            <li>School-specific sandals without embellishment</li>
            <li>Black or white sneakers</li>
            <li>School bag</li>
            <li>
              School-use items from only the student's assigned group
            </li>
          </ul>
        </div>
      </section>

      {/* LABELLING */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Label Personal Items
        </h2>

        <p className="text-gray-600">
          The harmonised prospectus advises that personal items should be
          clearly marked with the student's name. Confirm the preferred method
          of labelling with the school where necessary.
        </p>
      </section>

      {/* SCHOOL SPECIFIC */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Always Confirm with the Assigned School
        </h2>

        <p className="text-gray-600 mb-4">
          Even with a national harmonised prospectus, some details remain
          school-specific. These may include colours or specifications for
          shoes, belts, sandals, clothing and other items.
        </p>

        <p className="text-gray-600 font-semibold">
          Confirm these details with the student's school before purchasing.
        </p>
      </section>

      {/* RELATED */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Related SHS Shopping Guides
        </h2>

        <div className="flex flex-wrap gap-3">

            <Link
  href="/shs-commonly-forgotten-items-checklist"
  className="border px-4 py-2 rounded-xl"
>
  Commonly Forgotten SHS Items
</Link>
          <Link
            href="/shs-prospectus-shopping-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            SHS Prospectus Shopping
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
        </div>
      </section>

      {/* SOURCE NOTE */}
      <section className="border-t pt-6">
        <h2 className="text-lg font-bold mb-3">
          Source & Disclaimer
        </h2>

        <p className="text-sm text-gray-600 mb-3">
          This checklist is based on the 2026/2027 National Harmonised
          Prospectus released by the Ghana Education Service in September 2026.
          It is presented by DeeGlobalGH as a convenient reference for parents
          and students.
        </p>

        <p className="text-sm text-gray-600">
          DeeGlobalGH is not the Ghana Education Service. Always rely on the
          assigned school and official GES instructions for final admission
          requirements.
        </p>

        <p className="text-sm text-gray-600 mb-3">
  For official Ghana Education Service information and updates, visit the
  official GES website.
</p>

<a
  href="https://www.ges.gov.gh/"
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-700 font-semibold hover:underline"
>
  Visit the official Ghana Education Service website
</a>

      </section>
    </div>
  );
}