import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ Correct async params handling
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // ✅ Debug (keep for now)
  const count = await prisma.product.count();
  console.log("TOTAL PRODUCTS:", count);
  console.log("SLUG:", slug);

  // ✅ Fetch product
  const product = await prisma.product.findFirst({
    where: {
      slug: slug,
      isActive: true,
    },
  });

  console.log("FOUND PRODUCT:", product);

  // ❌ Not found → 404
  if (!product) {
    notFound();
  }

  // ✅ Related products
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
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/">Home</Link> /{" "}
        <Link href="/shop">Shop</Link> /{" "}
        <span>{product.name}</span>
      </div>

      {/* Main */}
      <div className="grid gap-10 md:grid-cols-2">
        
        {/* Image */}
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

        {/* Details */}
        <div className="rounded-2xl border bg-gray-50 p-8 shadow-sm">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Author */}
          {product.author && (
            <div className="mt-2 text-sm text-gray-600">
              Author: {product.author}
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <div className="mt-3 text-sm font-semibold">
              Product Code: {product.sku}
            </div>
          )}

          {/* Price */}
          <div className="mt-5 text-2xl font-bold">
            GH₵ {price.toFixed(2)}
          </div>

          {/* Summary */}
          {product.shortSummary && (
            <p className="mt-4">{product.shortSummary}</p>
          )}

{/* TRUST + DELIVERY */}
<div className="mt-6 bg-white border rounded-xl p-4 space-y-2 text-sm">

  <p>✔ NaCCA approved & New Curriculum aligned</p>

  <p>🚚 Fast delivery available in Kasoa, Accra & nationwide</p>

  <p>📦 Order today and receive your items without stress</p>

</div>
          {/* Add to Cart */}
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

          {/* Continue */}
          {/* WHATSAPP ORDER */}
<a
  href={`https://wa.me/233246011773?text=Hello, I want to order ${product.name}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-4 block w-full bg-yellow-500 text-black px-5 py-3 rounded-xl text-center font-bold"
>
  Order Now via WhatsApp
</a>
          <Link
            href="/shop"
            className="mt-4 block w-full rounded-xl border px-5 py-3 text-center"
            
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Description */}
      {product.fullDescription && (
        <div className="mt-14 max-w-none overflow-hidden">
          <div
            className="prose max-w-none break-words"
            dangerouslySetInnerHTML={{
              __html: product.fullDescription,
            }}
          />
        </div>
      )}
    </div>
  );
}