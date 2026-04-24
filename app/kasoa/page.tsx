import Link from "next/link";

export default function KasoaPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-blue-900 mb-4">
        Stationery & Textbooks in Kasoa
      </h1>

      <p className="text-gray-600 max-w-2xl">
        DeeglobalGh helps parents, students, and schools buy textbooks,
        stationery, exam materials, and school essentials in Kasoa.
        We deliver fast and make ordering easy.
      </p>

      {/* CTA */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <Link
          href="/shop"
          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Shop All Products
        </Link>

        <a
          href="https://wa.me/233246011773"
          target="_blank"
          className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold"
        >
          Order on WhatsApp
        </a>
      </div>

      {/* WHAT YOU CAN BUY */}
      <h2 className="mt-10 text-xl font-bold">What you can buy in Kasoa</h2>

      <div className="mt-4 grid md:grid-cols-2 gap-4">

        <Link href="/shop?category=textbooks" className="border p-4 rounded-xl hover:bg-gray-50">
          <h3 className="font-semibold">Textbooks</h3>
          <p className="text-sm text-gray-500">
            Pre-School to SHS textbooks.
          </p>
        </Link>

        <Link href="/shop?category=exam-materials" className="border p-4 rounded-xl hover:bg-gray-50">
          <h3 className="font-semibold">Exam Materials</h3>
          <p className="text-sm text-gray-500">
            BECE and WASSCE preparation items.
          </p>
        </Link>

        <Link href="/shop?category=stationery" className="border p-4 rounded-xl hover:bg-gray-50">
          <h3 className="font-semibold">School Essentials</h3>
          <p className="text-sm text-gray-500">
            Pens, pencils, rulers, calculators, and more.
          </p>
        </Link>

        <Link href="/shop?category=dormitory" className="border p-4 rounded-xl hover:bg-gray-50">
          <h3 className="font-semibold">Dormitory Essentials</h3>
          <p className="text-sm text-gray-500">
            For boarding students and school reopening.
          </p>
        </Link>

      </div>

      {/* SHOP BY LEVEL */}
      <h2 className="mt-10 text-xl font-bold">Shop by level</h2>

      <div className="mt-4 flex flex-wrap gap-2">

        {[
          { name: "Basic 1", slug: "basic-1" },
          { name: "Basic 2", slug: "basic-2" },
          { name: "Basic 3", slug: "basic-3" },
          { name: "Basic 4", slug: "basic-4" },
          { name: "Basic 5", slug: "basic-5" },
          { name: "Basic 6", slug: "basic-6" },
          { name: "JHS", slug: "jhs" },
          { name: "SHS", slug: "shs" },
        ].map((level) => (
          <Link
            key={level.slug}
            href={`/shop?level=${level.slug}`}
            className="border px-4 py-2 rounded-full text-sm hover:bg-gray-100"
          >
            {level.name}
          </Link>
        ))}

      </div>

    </div>
  );
}