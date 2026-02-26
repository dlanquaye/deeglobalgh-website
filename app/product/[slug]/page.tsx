import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: {
        not: product.id,
      },
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  const price = Number(product.retailPrice);
  const outOfStock = product.stockQty <= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/">Home</Link> /{" "}
        <Link href="/shop">Shop</Link> /{" "}
        <span>{product.name}</span>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <div className="relative h-[420px]">
            <Image
              src={product.imageSrc || "/products/placeholder.webp"}
              alt={product.imageAlt || product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-gray-50 p-8">
          <h1 className="text-3xl font-bold">
            {product.name}
          </h1>

          {product.sku && (
            <div className="mt-3 text-sm font-semibold">
              Product Code: {product.sku}
            </div>
          )}

          <div className="mt-5 text-2xl font-bold">
            GH₵ {price.toFixed(2)}
          </div>

          {product.shortSummary && (
            <p className="mt-4">
              {product.shortSummary}
            </p>
          )}

          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                retailPrice: price,
                imageSrc: product.imageSrc,
                stockQty: product.stockQty,
              }}
              outOfStock={outOfStock}
            />
          </div>

          <Link
            href="/shop"
            className="mt-4 block w-full rounded-xl border px-5 py-3 text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {product.fullDescription && (
        <div className="mt-14 prose max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: product.fullDescription,
            }}
          />
        </div>
      )}
    </div>
  );
}