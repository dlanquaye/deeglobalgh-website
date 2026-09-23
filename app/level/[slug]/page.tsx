import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.shopdeeglobalgh.com";

type Product = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
};

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function prettifySlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const pretty = prettifySlug(slug);

  const title = `${pretty} Textbooks & Stationery | DeeGlobalGH`;
  const description = `Shop ${pretty} textbooks, stationery and school supplies from DeeGlobalGH in Kasoa, Ghana. Browse available learning materials and order for collection or delivery.`;
  const canonicalUrl = `${SITE_URL}/level/${slug}`;

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
  };
}

export default async function LevelPage({ params }: Props) {
  const { slug } = await params;
  const pretty = prettifySlug(slug);

  let products: Product[] = [];

  try {
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        websiteVisible: true,
        levelSlugs: {
          has: slug,
        },
      },
      take: 40,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        retailPrice: true,
      },
    });
  } catch (error) {
    console.error("Database error (level page):", error);
    products = [];
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">
        {pretty} Textbooks & School Supplies
      </h1>

      <p className="mb-3 text-gray-600">
        Browse textbooks, stationery and learning materials for {pretty} from
        DeeGlobalGH in Kasoa.
      </p>

      <p className="mb-6 text-gray-600">
        Product availability may vary, so you can check the current selection
        below or contact us if you have a specific school list or book
        requirement.
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="rounded-xl bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800"
        >
          Shop All Products
        </Link>

        <Link
          href="/school-list-items-kasoa"
          className="rounded-xl border px-4 py-2 font-semibold"
        >
          School List Shopping
        </Link>

        <a
          href="https://wa.me/233270030000"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400"
        >
          Order on WhatsApp
        </a>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">
          No active products found for this level.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="rounded-xl border p-3 transition hover:bg-gray-50"
            >
              <div className="text-sm font-semibold">{product.name}</div>

              <div className="mt-1 font-bold text-blue-900">
                GH₵ {product.retailPrice.toFixed(2)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}