import Link from "next/link";

export const metadata = {
  title: "Textbooks in Kasoa | Pre-School to SHS | DeeglobalGh",
  description:
    "Buy Textbooks in Kasoa for Pre-School, Basic 1–6, JHS 1–3 and SHS 1–3. Combined Edition textbooks available. Order from DeeglobalGh for fast delivery.",
  alternates: {
    canonical: "https://deeglobalgh.com/textbooks-in-kasoa",
  },
};

export default function TextbooksInKasoaPage() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Textbooks in Kasoa",
    url: "https://deeglobalgh.com/textbooks-in-kasoa",
    about: "Textbooks in Kasoa",
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
        Buy Textbooks in Kasoa
      </h1>

      <p className="mt-4 max-w-3xl text-gray-700">
        Looking for <strong>Textbooks in Kasoa</strong>? DeeglobalGh stocks
        Textbooks for <strong>Pre-School</strong>, <strong>Basic 1–Basic 6</strong>,{" "}
        <strong>JHS 1–JHS 3</strong>, and <strong>SHS 1–SHS 3</strong>.
        We also have <strong>Combined Edition textbooks</strong> for JHS and SHS.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/category/textbooks"
          className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-6 py-3 font-extrabold text-white hover:opacity-90"
        >
          Browse Textbooks
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
        <h2 className="text-xl font-bold">Textbooks by School Level</h2>
        <p className="mt-2 text-gray-700">
          Choose a level to quickly find the right textbooks.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: "Pre-School", slug: "pre-school" },
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
          Delivery of textbooks in Kasoa
        </h2>
        <p className="mt-2 text-gray-700">
          We deliver Textbooks within Kasoa and nearby areas. You can order on
          WhatsApp or browse online and choose what you need.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Popular textbook categories</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/category/textbooks"
            className="rounded-2xl border bg-white p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">Textbooks</div>
            <div className="mt-1 text-sm text-gray-600">
              All class levels covered.
            </div>
          </Link>

          <Link
            href="/category/jhs-combined-edition-textbooks"
            className="rounded-2xl border bg-white p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">JHS Combined Edition</div>
            <div className="mt-1 text-sm text-gray-600">
              JHS 1–3 combined textbooks.
            </div>
          </Link>

          <Link
            href="/category/shs-combined-edition-textbooks"
            className="rounded-2xl border bg-white p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">SHS Combined Edition</div>
            <div className="mt-1 text-sm text-gray-600">
              SHS 1–3 combined textbooks.
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
