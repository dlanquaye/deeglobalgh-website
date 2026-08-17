import type { Metadata } from "next";
import Link from "next/link";

import ProductCard from "@/app/components/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Exercise Books & A4 Paper in Kasoa | Retail & Wholesale | DeeglobalGH",
  description:
    "Buy Note 1 exercise books and Deli MateCopy A4 paper in Kasoa. Retail and wholesale supply for parents, students, schools, offices, retailers and institutions across Ghana.",
  alternates: {
    canonical:
      "https://www.shopdeeglobalgh.com/exercise-books-a4-paper-kasoa",
  },
};

const FEATURED_SKUS = [
  "SCH-GEN-EXB-0064",
  "SCH-GEN-EXB-0065",
  "SCH-GEN-EXB-0069",
  "SCH-GEN-EXB-0070",
  "SCH-DEL-A4P-0001",
  "SCH-DEL-A4P-0002",
];

export default async function ExerciseBooksA4PaperKasoaPage() {
  const products = await prisma.product.findMany({
    where: {
      sku: {
        in: FEATURED_SKUS,
      },
      isActive: true,
      websiteVisible: true,
    },
    orderBy: [
      {
        subCategorySlug: "asc",
      },
      {
        retailPrice: "asc",
      },
    ],
  });

  const exerciseBooks = products.filter(
    (product) =>
      product.subCategorySlug === "exercise-books"
  );

  const a4Paper = products.filter(
    (product) =>
      product.subCategorySlug === "a4-paper"
  );

  return (
    <main className="bg-gray-50">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl bg-blue-900 px-6 py-10 text-white shadow-lg md:px-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-yellow-300">
            Retail & Wholesale School Supplies
          </p>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
            Exercise Books & A4 Paper in Kasoa
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100 md:text-lg">
            Buy Note 1 exercise books and Deli MateCopy A4 paper from
            DeeglobalGH. We supply individual customers as well as schools,
            offices, retailers and institutions that need larger quantities.
          </p>

          <p className="mt-3 max-w-3xl text-base leading-7 text-blue-100">
            Whether you need a few packs for school, A4 paper for the office,
            or bulk quantities for resale or institutional use, we can help
            with both retail and wholesale orders.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="https://wa.me/233270030000?text=Hello%20DeeglobalGH%2C%20I%20would%20like%20to%20order%20exercise%20books%20or%20A4%20paper."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-300"
            >
              Order on WhatsApp
            </a>

            <a
              href="https://wa.me/233270030000?text=Hello%20DeeglobalGH%2C%20please%20send%20me%20your%20current%20wholesale%20or%20bulk%20price%20for%20exercise%20books%20and%20A4%20paper."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white px-6 py-3 font-bold text-white hover:bg-white hover:text-blue-900"
            >
              Request Wholesale Price
            </a>
          </div>
        </div>
      </section>

      {/* BUYER TYPES */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900">
              Retail Customers
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Parents, students and individuals can buy convenient pack sizes
              and single reams for everyday school, home and office use.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900">
              Schools & Offices
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              We supply exercise books and A4 paper for classrooms,
              administration, examinations, printing and general office work.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-blue-900">
              Wholesale & Bulk Buyers
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Retailers, resellers and institutions can contact us for current
              wholesale and bulk-order pricing based on the quantity required.
            </p>
          </div>
        </div>
      </section>

      {/* EXERCISE BOOKS */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            School Exercise Books
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
            Note 1 Exercise Books – 40 & 60 Leaves
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-gray-600">
            Choose from 40-leaf and 60-leaf Note 1 exercise books in practical
            pack sizes. The range is suitable for students, parents, schools
            and bulk buyers preparing for the academic term.
          </p>
        </div>

        {exerciseBooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {exerciseBooks.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-6">
            Exercise books are currently being updated. Contact us on WhatsApp
            for availability.
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/shop?search=exercise%20book"
            className="inline-block rounded-xl bg-blue-900 px-6 py-3 font-bold text-white"
          >
            Browse Exercise Books
          </Link>
        </div>
      </section>

      {/* A4 PAPER */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Printing & Office Paper
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
              Deli MateCopy A4 Paper 80gsm
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-gray-600">
              Deli MateCopy A4 80gsm multipurpose paper is available by the
              500-sheet ream and by the 5-ream carton. It is suitable for
              schools, offices, businesses and general printing or copying.
            </p>

            <p className="mt-3 max-w-3xl leading-7 text-gray-600">
              Buy a ream for everyday use or contact DeeglobalGH for bulk and
              wholesale supply when ordering for offices, institutions,
              retailers or other high-volume requirements.
            </p>
          </div>

          {a4Paper.length > 0 ? (
            <div className="grid max-w-2xl grid-cols-2 gap-6">
              {a4Paper.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-gray-50 p-6">
              Deli A4 paper availability is being updated. Contact us on
              WhatsApp for current stock.
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/shop?search=deli%20a4"
              className="inline-block rounded-xl bg-blue-900 px-6 py-3 font-bold text-white"
            >
              Shop Deli A4 Paper
            </Link>
          </div>
        </div>
      </section>

      {/* WHOLESALE */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border bg-white p-7 shadow-sm md:p-10">
          <h2 className="text-2xl font-bold text-blue-900">
            Need Wholesale Exercise Books or A4 Paper?
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-gray-600">
            DeeglobalGH supplies both retail and wholesale customers. Schools,
            offices, shops, resellers and institutions that require larger
            quantities can contact us for current bulk pricing and
            availability.
          </p>

          <p className="mt-3 max-w-3xl leading-7 text-gray-600">
            Tell us the product and quantity you need and we will provide the
            appropriate quotation based on current stock and pricing.
          </p>

          <a
            href="https://wa.me/233270030000?text=Hello%20DeeglobalGH%2C%20I%20need%20a%20wholesale%20quotation%20for%20exercise%20books%20or%20A4%20paper."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
          >
            Get a Bulk / Wholesale Quote
          </a>
        </div>
      </section>

      {/* LOCAL SEO */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Where to Buy Exercise Books and A4 Paper in Kasoa
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            DeeglobalGH supplies educational materials, stationery and school
            essentials in Kasoa. Customers can order Note 1 exercise books,
            Deli MateCopy A4 paper, textbooks and other school supplies from
            one place.
          </p>

          <p className="mt-3 leading-7 text-gray-600">
            We serve individual retail customers as well as schools, offices,
            retailers and institutional buyers requiring larger quantities.
            Delivery can also be arranged for customers beyond Kasoa.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/stationery-in-kasoa"
              className="rounded-xl border px-4 py-2 font-semibold hover:bg-gray-100"
            >
              Stationery in Kasoa
            </Link>

            <Link
              href="/textbooks-in-kasoa"
              className="rounded-xl border px-4 py-2 font-semibold hover:bg-gray-100"
            >
              Textbooks in Kasoa
            </Link>

            <Link
              href="/school-list-items-kasoa"
              className="rounded-xl border px-4 py-2 font-semibold hover:bg-gray-100"
            >
              School List Items
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
