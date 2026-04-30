import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CategoryClient from "./CategoryClient";
import Link from "next/link";

const SITE_URL = "https://shopdeeglobalgh.com";

function prettifySlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const pretty = prettifySlug(slug);

  const title = `${pretty} | DeeglobalGh`;
  let description = `Shop ${pretty} in Ghana. Order from DeeglobalGh for fast delivery in Kasoa and beyond.`;

  if (slug === "story-books") {
    description =
      "Buy story books for kids and students in Ghana. Shop African story books, literature books, and reading books with fast delivery from DeeglobalGh.";
  }

  const canonicalUrl = `${SITE_URL}/category/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let products: any[] = [];

  try {
    const data = await prisma.product.findMany({
      where: {
        categorySlug: slug,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        retailPrice: true,
        imageSrc: true,
        stockQty: true,
        categorySlug: true,
      },
    });

    products = data || [];
  } catch (error) {
    console.error("Database error (category page):", error);
    products = [];
  }

  return (
    <main className="bg-gray-50 min-h-screen">

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 text-white p-6 shadow-lg">

          <h1 className="text-2xl font-bold">
            {slug.replace(/-/g, " ").toUpperCase()} in Kasoa
          </h1>

          <p className="text-white/90 mt-2 max-w-2xl">
            Shop NaCCA approved textbooks, learning aids, exam materials,
            boarding essentials, and full school supplies.
            Fast delivery across Ghana.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">

            <Link
              href="/shop"
              className="bg-white text-blue-900 px-5 py-2 rounded-xl font-semibold"
            >
              Shop All
            </Link>

            <a
              href="https://wa.me/233246011773"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-semibold"
            >
              Order Now via WhatsApp
            </a>

          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-8">

        {/* TEXTBOOK NAV */}
        {slug === "textbooks" && (
          <div className="mb-10">

            <h2 className="text-lg font-semibold mb-4">
              Shop by Level
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

              <a href="/category/textbooks/pre-school" className="group rounded-2xl p-5 bg-gradient-to-r from-pink-100 to-pink-50 border border-pink-200 hover:shadow-md transition">
                <p className="font-semibold group-hover:text-pink-700">Pre-School</p>
                <p className="text-xs text-gray-500 mt-1">Foundation learning books</p>
              </a>

              <a href="/category/textbooks/basic-1-3" className="group rounded-2xl p-5 bg-gradient-to-r from-green-100 to-green-50 border border-green-200 hover:shadow-md transition">
                <p className="font-semibold group-hover:text-green-700">Basic 1–3</p>
                <p className="text-xs text-gray-500 mt-1">Early learning essentials</p>
              </a>

              <a href="/category/textbooks/basic-4-6" className="group rounded-2xl p-5 bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 hover:shadow-md transition">
                <p className="font-semibold group-hover:text-blue-700">Basic 4–6</p>
                <p className="text-xs text-gray-500 mt-1">Upper primary textbooks</p>
              </a>

              <a href="/category/exam-materials/jhs" className="group rounded-2xl p-5 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 hover:shadow-md transition">
                <p className="font-semibold group-hover:text-yellow-700">JHS</p>
                <p className="text-xs text-gray-500 mt-1">BECE preparation</p>
              </a>

              <a href="/category/textbooks/jhs-combined" className="group rounded-2xl p-5 bg-gradient-to-r from-indigo-100 to-indigo-50 border border-indigo-200 hover:shadow-md transition">
                <p className="font-semibold group-hover:text-indigo-700">JHS Combined</p>
                <p className="text-xs text-gray-500 mt-1">Basic 7–9 combined</p>
              </a>

              <a href="/category/textbooks/shs" className="group rounded-2xl p-5 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 hover:shadow-md transition">
                <p className="font-semibold group-hover:text-purple-700">SHS</p>
                <p className="text-xs text-gray-500 mt-1">SHS split levels</p>
              </a>

              <a href="/category/textbooks/shs-combined" className="group rounded-2xl p-5 bg-gradient-to-r from-indigo-100 to-indigo-50 border border-indigo-200 hover:shadow-md transition">
                <p className="font-semibold group-hover:text-indigo-700">SHS Combined</p>
                <p className="text-xs text-gray-500 mt-1">SHS 1–3 combined</p>
              </a>

              <a href="/category/exam-materials/shs" className="group rounded-2xl p-5 bg-gradient-to-r from-green-100 to-green-50 border border-green-200 hover:shadow-md transition">
                <p className="font-semibold group-hover:text-green-700">SHS (WASSCE)</p>
                <p className="text-xs text-gray-500 mt-1">Exam preparation</p>
              </a>

            </div>
          </div>
        )}

        {/* EXAM NAV */}
        {slug === "exam-materials" && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Select Exam Level</h2>

            <div className="grid grid-cols-2 gap-4">

              <a href="/category/exam-materials/jhs" className="rounded-xl p-4 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition text-center">
                JHS (BECE)
              </a>

              <a href="/category/exam-materials/shs" className="rounded-xl p-4 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 transition text-center">
                SHS (WASSCE)
              </a>

            </div>
          </div>
        )}

        {/* PRODUCTS */}
        <CategoryClient slug={slug} products={products} />

      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-6xl px-4 pb-10 grid md:grid-cols-3 gap-4">

        <div className="border rounded-xl p-4 bg-white">
          <h3 className="font-semibold">NaCCA Approved</h3>
          <p className="text-sm text-gray-600">
            All textbooks follow Ghana’s curriculum.
          </p>
        </div>

        <div className="border rounded-xl p-4 bg-white">
          <h3 className="font-semibold">Complete School Supplies</h3>
          <p className="text-sm text-gray-600">
            Everything in one place.
          </p>
        </div>

        <div className="border rounded-xl p-4 bg-white">
          <h3 className="font-semibold">Fast Delivery</h3>
          <p className="text-sm text-gray-600">
            Reliable delivery across Ghana.
          </p>
        </div>

      </section>

    </main>
  );
}