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

  return <CategoryClient slug={slug} products={products} />;
}