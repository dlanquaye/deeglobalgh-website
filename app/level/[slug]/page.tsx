import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";

const SITE_URL = "https://shopdeeglobalgh.com";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  const pretty = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const title = `${pretty} Products | DeeglobalGh`;
  const description = `Shop ${pretty} textbooks and school essentials in Ghana. Order from DeeglobalGh for fast delivery in Kasoa and beyond.`;

  const canonicalUrl = `${SITE_URL}/level/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
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

export default async function LevelPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const pretty = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const products = await prisma.product.findMany({
    where: {
      levelSlugs: {
        has: slug,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">{pretty}</h1>

      <p className="mt-2 text-gray-700">
        Showing products for <span className="font-semibold">{pretty}</span>.
      </p>

      <div className="mt-4">
        <Link
          href={`/shop?level=${slug}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 text-sm font-extrabold text-white hover:opacity-90"
        >
          View all in Shop
        </Link>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Found{" "}
        <span className="font-semibold">{products.length}</span>{" "}
        product{products.length === 1 ? "" : "s"} in this level.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.length > 0 ? (
          products.map((p) => {
            const imageSrc =
              p.imageSrc || "/products/placeholder.webp";

            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="rounded-2xl border bg-white p-4 hover:bg-gray-50"
              >
                <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50">
                  <Image
                    src={imageSrc.startsWith("/") ? imageSrc : `/${imageSrc}`}
                    alt={p.imageAlt || p.name}
                    title={p.imageTitle || p.name}
                    width={500}
                    height={500}
                    className="h-48 w-auto object-contain"
                  />
                </div>

                <div className="mt-3 font-semibold">{p.name}</div>
                <div className="mt-1 font-bold text-lg">
                  GH₵ {p.retailPrice}
                </div>

                <div className="mt-3 w-full rounded-xl bg-black px-4 py-3 text-center font-semibold text-white">
                  View Product
                </div>
              </Link>
            );
          })
        ) : (
          <div className="mt-6 rounded-2xl border bg-white p-6 text-gray-700">
            No products found for this level yet.
          </div>
        )}
      </div>
    </main>
  );
}
