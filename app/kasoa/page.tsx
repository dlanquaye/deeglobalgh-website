import Link from "next/link";

export const metadata = {
  title: "Stationery & Textbooks in Kasoa | DeeglobalGh",
  description:
    "Buy textbooks, stationery, exam materials, and school essentials in Kasoa. Order from DeeglobalGh for fast delivery across Kasoa and nearby areas.",
  alternates: {
    canonical: "https://shopdeeglobalgh.com/kasoa",
  },
};

export default function KasoaPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "DeeglobalGh",
    url: "https://shopdeeglobalgh.com",
    areaServed: "Kasoa",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kasoa",
      addressCountry: "GH",
    },
    telephone: "+233246011773",
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* ✅ Local Business Schema (Kasoa SEO boost) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      <h1 className="text-3xl font-extrabold text-blue-900">
        Stationery & Textbooks in Kasoa
      </h1>

      <p className="mt-4 text-gray-700 max-w-3xl">
        DeeglobalGh helps parents, students, and schools buy{" "}
        <strong>textbooks</strong>, <strong>stationery</strong>,{" "}
        <strong>exam materials</strong>, and <strong>school essentials</strong>{" "}
        in Kasoa. We deliver fast, and we make it easy to order through the
        website or WhatsApp.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-6 py-3 font-extrabold text-white hover:opacity-90"
        >
          Shop All Products
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
        <h2 className="text-xl font-bold">What you can buy in Kasoa</h2>

        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <li className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">Textbooks</div>
            <div className="mt-1 text-sm text-gray-600">
              Pre-School to SHS (including Combined Editions).
            </div>
          </li>
          <li className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">Exam Materials</div>
            <div className="mt-1 text-sm text-gray-600">
              BECE and WASSCE preparation items.
            </div>
          </li>
          <li className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">School Essentials</div>
            <div className="mt-1 text-sm text-gray-600">
              Pens, pencils, rulers, crayons, calculators, and more.
            </div>
          </li>
          <li className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">Dormitory Essentials</div>
            <div className="mt-1 text-sm text-gray-600">
              For boarding students and school reopening.
            </div>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Shop by level</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: "Basic 1", slug: "basic-1" },
            { label: "Basic 2", slug: "basic-2" },
            { label: "Basic 3", slug: "basic-3" },
            { label: "Basic 4", slug: "basic-4" },
            { label: "Basic 5", slug: "basic-5" },
            { label: "Basic 6", slug: "basic-6" },
            { label: "JHS 1", slug: "jhs-1" },
            { label: "JHS 2", slug: "jhs-2" },
            { label: "JHS 3", slug: "jhs-3" },
            { label: "SHS 1", slug: "shs-1" },
            { label: "SHS 2", slug: "shs-2" },
            { label: "SHS 3", slug: "shs-3" },
          ].map((l) => (
            <Link
              key={l.slug}
              href={`/level/${l.slug}`}
              className="rounded-full border px-4 py-2 text-sm font-bold text-blue-900 hover:bg-gray-50"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-blue-900">
          Delivery in Kasoa and nearby areas
        </h2>
        <p className="mt-2 text-gray-700">
          We deliver within Kasoa and also support delivery to nearby areas.
          Confirm delivery location and fees on WhatsApp.
        </p>
      </section>
    </main>
  );
}
