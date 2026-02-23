import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
    },
    take: 3,
  });

  const outOfStock = product.stockQty <= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      {/* ================= BREADCRUMB ================= */}
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <Link href="/shop" className="hover:underline">Shop</Link> /{" "}
        <span className="text-gray-900">{product.name}</span>
      </div>

      {/* ================= PRODUCT SECTION ================= */}
      <div className="grid gap-10 md:grid-cols-2">

        {/* IMAGE */}
        <div className="rounded-2xl border bg-white p-6">
          {product.imageSrc && (
            <div className="relative h-[420px]">
              <Image
                src={product.imageSrc}
                alt={product.imageAlt || product.name}
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="rounded-2xl border bg-gray-50 p-8">
          <h1 className="text-3xl font-bold text-blue-900">
            {product.name}
          </h1>

          {product.sku && (
            <div className="mt-3 inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold">
              Product Code: {product.sku}
            </div>
          )}

          <div className="mt-5 text-2xl font-bold text-blue-900">
            GH₵ {product.retailPrice.toFixed(2)}
          </div>

          {product.shortSummary && (
            <p className="mt-4 text-gray-700">
              {product.shortSummary}
            </p>
          )}

          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                retailPrice: product.retailPrice,
                imageSrc: product.imageSrc,
                stockQty: product.stockQty,
              }}
              outOfStock={outOfStock}
            />
          </div>

          <Link
            href="/shop"
            className="mt-4 block w-full rounded-xl border px-5 py-3 text-center font-semibold hover:bg-gray-50"
          >
            Continue Shopping
          </Link>

          <div className="mt-6 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
            Fast delivery across Kasoa and nearby areas. Delivery fee depends on your location.
          </div>
        </div>
      </div>

      {/* ================= FULL DESCRIPTION ================= */}
      {product.fullDescription && (
        <div className="mt-14 prose max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: product.fullDescription,
            }}
          />
        </div>
      )}

      {/* ================= RELATED PRODUCTS ================= */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Link href="/shop" className="text-sm font-semibold text-blue-900">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="rounded-2xl border bg-white p-4 hover:shadow-sm"
              >
                <div className="relative h-48 bg-gray-50">
                  <Image
                    src={item.imageSrc || "/products/placeholder.webp"}
                    alt={item.name}
                    fill
                    className="object-contain p-3"
                  />
                </div>
                <div className="mt-3 font-semibold">{item.name}</div>
                <div className="mt-1 font-bold text-blue-900">
                  GH₵ {item.retailPrice.toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}