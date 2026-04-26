import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CategoryClient from "./CategoryClient";

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

  // Special landing page
  if (slug === "exam-past-questions") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Exam Past Questions</h1>
        <p className="mt-2 text-gray-700">
          Shop verified Past Questions for BECE and WASSCE.
        </p>
      </main>
    );
  }

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
  <main className="mx-auto max-w-6xl px-4 py-6">

    {/* ✅ TEXTBOOK SUBCATEGORY NAV */}
    {slug === "textbooks" && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">
          Shop by Level
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

          <a href="/category/textbooks/basic-1-3" className="rounded-xl p-4 text-center font-medium bg-green-50 hover:bg-blue-100 border border-green-200 transition">
            Basic 1–3
          </a>

          <a href="/category/textbooks/basic-4-6" className="rounded-xl p-4 text-center font-medium bg-blue-50 hover:bg-blue-100 border border-blue-200 transition">
            Basic 4–6
          </a>

          <a href="/category/textbooks/jhs" className="rounded-xl p-4 text-center font-medium bg-teal-50 hover:bg-blue-100 border border-yellow-200 transition">
            JHS
          </a>

          <a href="/category/textbooks/shs" className="rounded-xl p-4 text-center font-medium bg-blue-50 hover:bg-blue-100 border border-blue-200 transition">
            SHS
          </a>

          <a href="/category/textbooks/jhs-combined" className="rounded-xl p-4 text-center font-medium bg-teal-50 hover:bg-blue-100 border border-blue-200 transition">
            JHS Combined
          </a>

          <a href="/category/textbooks/shs-combined" className="rounded-xl p-4 text-center font-medium bg-blue-50 hover:bg-blue-100 border border-blue-200 transition">
            SHS Combined
          </a>

          <a href="/category/textbooks/pre-school" className="rounded-xl p-4 text-center font-medium bg-pink-50 hover:bg-pink-100 border border-pink-200 transition">
  Pre-School
</a>

        </div>
      </div>
    )}
{/* ✅ EXAM MATERIALS SUBCATEGORY NAV */}
{slug === "exam-materials" && (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-3">
      Select Exam Level
    </h2>

    <div className="grid grid-cols-2 gap-3">

      <a href="/category/exam-materials/jhs" className="rounded-xl p-4 text-center font-medium bg-yellow-50 hover:bg-blue-100 border border-blue-200 transition">
        JHS (BECE)
      </a>

      <a href="/category/exam-materials/shs" className="rounded-xl p-4 text-center font-medium bg-cyan-50 hover:bg-blue-100 border border-blue-200 transition">
        SHS (WASSCE)
      </a>

    </div>
  </div>
)}
    <CategoryClient slug={slug} products={products} />
  </main>
);
}