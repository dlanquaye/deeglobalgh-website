import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CategoryClient from "./CategoryClient";

const SITE_URL = "https://shopdeeglobalgh.com";

function prettifySlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const pretty = prettifySlug(slug);

  const title = `${pretty} | DeeglobalGh`;
  const description = `Shop ${pretty} in Ghana. Order from DeeglobalGh for fast delivery in Kasoa and beyond.`;

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

  // Special landing page remains static
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

  // 🔥 FETCH REAL PRODUCTS FROM DATABASE
  const products = await prisma.product.findMany({
    where: { categorySlug: slug },
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

  return <CategoryClient slug={slug} products={products} />;
}