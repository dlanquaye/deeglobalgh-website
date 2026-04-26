import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CategoryClient from "../CategoryClient";

const SITE_URL = "https://shopdeeglobalgh.com";

function prettifySlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}): Promise<Metadata> {
  const { slug, sub } = await params;

  const prettyMain = prettifySlug(slug);
  const prettySub = prettifySlug(sub);

  const title = `${prettySub} ${prettyMain} | DeeglobalGh`;
  const description = `Shop ${prettySub} ${prettyMain} in Ghana. Order from DeeglobalGh for fast delivery in Kasoa and beyond.`;

  const canonicalUrl = `${SITE_URL}/category/${slug}/${sub}`;

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
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = await params;

  let products: any[] = [];

  try {
    const data = await prisma.product.findMany({
      where: {
        categorySlug: slug,
        subCategorySlug: sub,
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

      {/* 🔙 Back Button */}
      <div className="mb-4">
        <a
          href={`/category/${slug}`}
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          ← Back to {prettifySlug(slug)}
        </a>
      </div>

      {/* 📍 Breadcrumb */}
      <div className="text-sm text-gray-500 mb-3">
        <a href="/" className="hover:underline">Home</a> {" / "}
        <a href={`/category/${slug}`} className="hover:underline">
          {prettifySlug(slug)}
        </a> {" / "}
        <span className="text-gray-700 font-medium">
          {prettifySlug(sub)}
        </span>
      </div>

      <CategoryClient slug={slug} products={products} />
    </main>
  );
}