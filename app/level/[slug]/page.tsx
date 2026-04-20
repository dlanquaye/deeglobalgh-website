import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
};

type Props = {
  params: {
    slug?: string;
  };
};

/* -------------------------------------------
   SAFE SLUG FORMATTER
------------------------------------------- */
function prettifySlug(slug?: string) {
  if (!slug) return "";

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* -------------------------------------------
   METADATA
------------------------------------------- */
export async function generateMetadata({ params }: Props) {
  const slug = params?.slug || "";
  const pretty = prettifySlug(slug);

  return {
    title: `${pretty} Textbooks & Stationery | DeeglobalGh`,
    description: `Shop ${pretty} textbooks and school supplies in Ghana. Fast delivery available in Kasoa and beyond.`,
  };
}

/* -------------------------------------------
   PAGE
------------------------------------------- */
export default async function LevelPage({ params }: Props) {
  const { slug = "" } = await params;
  const baseLevel = slug.split("-")[0];
  const pretty = prettifySlug(slug);

  const products: Product[] = slug
  ? await prisma.product.findMany({
      where: {
        levelSlugs: {
  has: baseLevel,
}
      },
      take: 40,
    })
  : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Title */}
      <h1 className="text-2xl font-bold mb-2">
        {pretty || "School Level"} Textbooks
      </h1>

      <p className="text-gray-600 mb-6">
        Shop textbooks and school supplies for {pretty || "all levels"} in Ghana.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-3 mb-8 flex-wrap">

        <Link href="/shop">
          <button className="btn-primary">
            Shop All Products
          </button>
        </Link>

        <a
          href="https://wa.me/233246011773"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold">
            Order on WhatsApp
          </button>
        </a>

      </div>

      {/* Products */}
      {products.length === 0 ? (
        <p className="text-gray-500">
          No products found for this level.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`}>
              <div className="border p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                
                <div className="font-semibold text-sm">
                  {product.name}
                </div>

                <div className="text-blue-900 font-bold mt-1">
                  GH₵ {product.retailPrice}
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}