import Link from "next/link";

export const metadata = {
  title: "Commonly Forgotten SHS Items Checklist | Boys & Girls Ghana",
  description:
    "DeeGlobalGH practical checklist of commonly forgotten SHS boarding and school items for boys and girls in Ghana. Use it alongside the official school prospectus.",
  alternates: {
    canonical:
      "https://www.shopdeeglobalgh.com/shs-commonly-forgotten-items-checklist",
  },
};

export default function ShsForgottenItemsChecklistPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">
        DeeGlobalGH Commonly Forgotten SHS Items Checklist
      </h1>

      <p className="text-gray-600 mb-6">
        This practical checklist is designed to help parents, guardians and
        students remember small but useful items that are often forgotten while
        preparing for SHS boarding, reopening or admission.
      </p>

      {/* DISCLAIMER */}
      <section className="border-2 border-amber-500 bg-amber-50 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-bold text-amber-900 mb-3">
          Important: This Is a DeeGlobalGH Practical Checklist
        </h2>

        <p className="text-amber-900 mb-3">
          These are practical suggestions only. They are not official GES
          requirements and they do not replace the prospectus or instructions
          from the specific school your child has been placed in.
        </p>

        <p className="text-amber-900 font-semibold">
          Always confirm the final requirements with the assigned school before
          buying.
        </p>
      </section>

      {/* CTA */}
      <div className="flex flex-wrap gap-3 mb-10">
        <a
          href="https://wa.me/233270030000?text=Hello%20DeeGlobalGH%2C%20I%20would%20like%20help%20checking%20items%20for%20SHS%20boarding%20or%20school%20reopening."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
        >
          Ask About Available Items
        </a>

        <Link
          href="/ges-harmonised-shs-prospectus-2026-2027"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          View GES Prospectus Checklist
        </Link>

        <Link
          href="/boarding-school-essentials-kasoa"
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Boarding School Essentials
        </Link>
      </div>

      {/* COMMON TO BOTH */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Commonly Forgotten Items for Both Boys and Girls
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Personal Care</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Sponge bag or toiletries bag</li>
              <li>Extra bathing sponge</li>
              <li>Small face towel</li>
              <li>Nail cutter</li>
              <li>Comb or hair brush</li>
              <li>Body cream or pomade</li>
              <li>Deodorant</li>
              <li>Extra toothbrush</li>
              <li>Small mirror where allowed</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Laundry & Clothing Care</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Laundry bag</li>
              <li>Clothes pegs</li>
              <li>Clothes hangers</li>
              <li>Small sewing kit</li>
              <li>Shoe brush</li>
              <li>Shoe polish where applicable</li>
              <li>Extra socks</li>
              <li>Extra underwear</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Dormitory & Daily Use</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Padlock with spare key</li>
              <li>Water bottle</li>
              <li>Small torch or rechargeable light where allowed</li>
              <li>Plastic bowl or small basin where allowed</li>
              <li>Extra drinking cup</li>
              <li>Small storage containers</li>
              <li>Label stickers or permanent marker</li>
            </ul>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Academic Backups</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Extra pens</li>
              <li>Extra pencils</li>
              <li>Eraser</li>
              <li>Pencil sharpener</li>
              <li>Ruler</li>
              <li>Notebook for personal notes</li>
              <li>Spare exercise books</li>
              <li>Permanent marker for labelling</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BOYS */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Commonly Forgotten Items for Boys
        </h2>

        <div className="border rounded-xl p-5 bg-white">
          <ul className="text-gray-700 space-y-2">
            <li>Extra singlets or round-neck undershirts</li>
            <li>Extra underwear</li>
            <li>Hair brush or comb</li>
            <li>Shaving items only if permitted by the school</li>
            <li>Extra socks</li>
            <li>Shoe polish and brush where applicable</li>
            <li>Small sewing kit for minor clothing repairs</li>
            <li>Personal toiletries bag</li>
          </ul>
        </div>
      </section>

      {/* GIRLS */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Commonly Forgotten Items for Girls
        </h2>

        <div className="border rounded-xl p-5 bg-white">
          <ul className="text-gray-700 space-y-2">
            <li>Extra sanitary pads</li>
            <li>Sanitary disposal bags where useful</li>
            <li>Hair comb or brush</li>
            <li>Hair bands or simple hair accessories where permitted</li>
            <li>Extra underwear</li>
            <li>Extra socks</li>
            <li>Small face towel</li>
            <li>Personal toiletries bag or sponge bag</li>
          </ul>
        </div>
      </section>

      {/* REPORTING DAY */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Reporting-Day Items Parents Often Forget
        </h2>

        <div className="border rounded-xl p-5 bg-white">
          <ul className="text-gray-700 space-y-2">
            <li>Printed admission or placement documents</li>
            <li>School-specific forms requested by the school</li>
            <li>Passport photographs if required</li>
            <li>Medical information or medication instructions where needed</li>
            <li>Emergency contact details</li>
            <li>Small amount of permitted pocket money if applicable</li>
            <li>Phone numbers written down separately</li>
            <li>Clearly labelled luggage and personal items</li>
          </ul>
        </div>
      </section>

      {/* BEFORE LEAVING HOME */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Quick Check Before Leaving Home
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Documents</h3>
            <p className="text-gray-700">
              Confirm admission documents, school forms, identification and any
              school-specific paperwork.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Labelling</h3>
            <p className="text-gray-700">
              Label clothes, bedding, chop box, suitcase, bucket, stationery
              and other personal items where appropriate.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">School-Specific Requirements</h3>
            <p className="text-gray-700">
              Recheck colours, sizes, quantities, assigned group items and any
              special instructions from the school.
            </p>
          </div>

          <div className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold mb-3">Availability</h3>
            <p className="text-gray-700">
              Contact DeeGlobalGH before travelling if you want us to help check
              available items and prepare what is in stock.
            </p>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">
          Related SHS Preparation Guides
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/ges-harmonised-shs-prospectus-2026-2027"
            className="border px-4 py-2 rounded-xl"
          >
            2026/2027 GES Prospectus Checklist
          </Link>

          <Link
            href="/shs-prospectus-shopping-kasoa"
            className="border px-4 py-2 rounded-xl"
          >
            SHS Prospectus Shopping in Kasoa
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

      {/* FINAL DISCLAIMER */}
      <section className="border-t pt-6">
        <h2 className="text-lg font-bold mb-3">
          DeeGlobalGH Practical Checklist Disclaimer
        </h2>

        <p className="text-sm text-gray-600">
          This page contains practical suggestions based on common school
          preparation needs. These items are not automatically required by GES
          or by every school. Always confirm the official prospectus and
          requirements with the student's assigned school before buying.
        </p>
      </section>
    </div>
  );
}