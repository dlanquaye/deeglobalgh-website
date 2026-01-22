import Link from "next/link";

export const metadata = {
  title: "Stationery in Kasoa | School Essentials | DeeglobalGh",
  description:
    "Buy stationery in Kasoa: pens, pencils, rulers, crayons, erasers, sharpeners, calculators, and school supplies. Order from DeeglobalGh for fast delivery in Kasoa.",
  alternates: {
    canonical: "https://shopdeeglobalgh.com/stationery-in-kasoa",
  },
};

export default function StationeryInKasoaPage() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Stationery in Kasoa",
    url: "https://shopdeeglobalgh.com/stationery-in-kasoa",
    about: "Stationery in Kasoa",
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* ✅ Page Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageSchema),
        }}
      />

      <h1 className="text-3xl font-extrabold text-blue-900">
        Buy Stationery in Kasoa
      </h1>

      <p className="mt-4 max-w-3xl text-gray-700">
        DeeglobalGh is a reliable place to buy{" "}
        <strong>stationery in Kasoa</strong>. We stock everyday school items
        including pens, pencils, erasers, sharpeners, rulers, crayons,{" "}
        calculators, and other <strong>school essentials</strong>.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/category/school-essentials"
          className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-6 py-3 font-extrabold text-white hover:opacity-90"
        >
          Browse School Essentials
        </Link>

        <a
          href="https://wa.me/233246011773"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-6 py-3 font-extrabold text-blue-950 hover:opacity-90"
        >
          Order on WhatsApp
        </a>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Popular stationery items</h2>

        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <li className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">Pens & Pencils</div>
            <div className="mt-1 text-sm text-gray-600">
              Ball pens, pencils, and writing tools for all levels.
            </div>
          </li>
          <li className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">Rulers & Maths Sets</div>
            <div className="mt-1 text-sm text-gray-600">
              Rulers, geometry sets, and mathematical instruments.
            </div>
          </li>
          <li className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">Crayons & Colours</div>
            <div className="mt-1 text-sm text-gray-600">
              For Creche, Nursery, KG, and lower primary pupils.
            </div>
          </li>
          <li className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">Calculators</div>
            <div className="mt-1 text-sm text-gray-600">
              Scientific calculators for SHS students and exams.
            </div>
          </li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-blue-900">
          Stationery delivery in Kasoa
        </h2>
        <p className="mt-2 text-gray-700">
          Order stationery online and get delivery within Kasoa and nearby areas.
          Confirm delivery location and fees on WhatsApp.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Explore related pages</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/kasoa"
            className="rounded-2xl border bg-white p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">Shop in Kasoa</div>
            <div className="mt-1 text-sm text-gray-600">
              View all Kasoa shopping options.
            </div>
          </Link>

          <Link
            href="/textbooks-in-kasoa"
            className="rounded-2xl border bg-white p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">Textbooks in Kasoa</div>
            <div className="mt-1 text-sm text-gray-600">
              Browse textbooks by level.
            </div>
          </Link>

          <Link
            href="/shop"
            className="rounded-2xl border bg-white p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">Shop All Products</div>
            <div className="mt-1 text-sm text-gray-600">
              Browse the full store catalog.
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
