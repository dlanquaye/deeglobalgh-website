import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pretty = prettifySlug(slug);

  return {
    title: `${pretty} Textbooks & Stationery | DeeglobalGh`,
    description: `Shop ${pretty} textbooks and school supplies in Ghana. Fast delivery available in Kasoa and beyond.`,
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
        {pretty} Textbooks
      </h1>

      <p className="mb-6 text-gray-600">
        Shop textbooks and school supplies for {pretty} in Ghana.
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="rounded-xl bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800"
        >
          Shop All Products
        </Link>

        <a
          href="https://wa.me/233246011773"
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