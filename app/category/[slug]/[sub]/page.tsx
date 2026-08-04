import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategoryClient from "../CategoryClient";

const SITE_URL = "https://shopdeeglobalgh.com";

function prettifySlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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
  isActive: true,
  websiteVisible: true,
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
    console.error("Database error (nested category page):", error);
    products = [];
  }

  const prettyMain = prettifySlug(slug);
  const prettySub = prettifySlug(sub);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href={`/category/${slug}`}
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          ← Back to {prettyMain}
        </Link>
      </div>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-3 text-sm text-gray-500"
      >
        <Link href="/" className="hover:underline">
          Home
        </Link>

        <span aria-hidden="true"> / </span>

        <Link href={`/category/${slug}`} className="hover:underline">
          {prettyMain}
        </Link>

        <span aria-hidden="true"> / </span>

        <span className="font-medium text-gray-700" aria-current="page">
          {prettySub}
        </span>
      </nav>

      <CategoryClient slug={slug} products={products} />
    </main>
  );
}