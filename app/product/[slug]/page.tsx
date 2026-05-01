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

    // MATCH CATEGORY
    categorySlug: product.categorySlug,

    // MATCH LEVEL (if exists)
    ...(product.levelSlugs?.length
      ? {
          levelSlugs: {
            hasSome: product.levelSlugs,
          },
        }
      : {}),
  },

  take: 4,
});

  const price = Number(product.retailPrice);
  const outOfStock = product.stockQty <= 0;

  const bundleItems = await prisma.product.findMany({
  where: {
    isActive: true,
    OR: [
      { name: { contains: "exercise", mode: "insensitive" } },
      { name: { contains: "pen", mode: "insensitive" } },
      { name: { contains: "set", mode: "insensitive" } },
    ],
  },
  take: 3,
});

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
          {/* STOCK STATUS */}
{product.stockQty > 0 && product.stockQty <= 5 && (
  <p className="mt-2 text-sm text-red-600 font-semibold">
    Only few left in stock
  </p>
)}

{product.stockQty <= 0 && (
  <p className="mt-2 text-sm text-red-600 font-semibold">
    Out of stock
  </p>
)}

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
  <p>✔ 100% New Curriculum (NaCCA Approved)</p>

  <p>🚚 Fast and reliable delivery in Kasoa, Accra & nationwide</p>

  <p>📦 Carefully packed to avoid damage</p>

  <p>💬 Order directly via WhatsApp for quick response</p>
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
  href={`https://wa.me/233246011773?text=${encodeURIComponent(
  `Hello, I want to order:
Product: ${product.name}
Price: GH₵ ${price.toFixed(2)}
Quantity: 1

Please assist me with delivery.`
)}`}
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
      
      {/* FREQUENTLY BOUGHT TOGETHER */}
{relatedProducts.length > 0 && (
  <div className="mt-16">
    <h2 className="text-xl font-semibold mb-4">
      Frequently Bought Together
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {relatedProducts.map((item) => (
        <div
  key={item.id}
className="border rounded-2xl p-3 md:p-4 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
>
  {/* IMAGE */}
  <div className="relative h-40 w-full mb-3">
    <Image
      src={item.imageSrc || "/products/placeholder.webp"}
      alt={item.name}
      fill
      className="object-contain"
    />
  
  </div>
  

  {/* NAME */}
<div className="text-xs md:text-sm font-semibold leading-tight line-clamp-2 min-h-[40px]">
      {item.name}
  </div>

  {/* PRICE */}
<div className="mt-1 text-lg font-bold text-[color:var(--brand-blue)]">
    GH₵ {Number(item.retailPrice).toFixed(2)}
  </div>

  {/* LINK */}
  <Link
  
  href={`/product/${item.slug}`}
  className="mt-3 inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition"
>
  View
</Link>
</div>
      ))}
    </div>
  </div>
)}
{/* YOU MAY ALSO NEED */}
{bundleItems.length > 0 && (
  <div className="mt-16">
    <h2 className="text-xl font-semibold mb-4">
      You May Also Need
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {bundleItems.map((item) => (
        <div
          key={item.id}
          className="border rounded-xl p-4 bg-white hover:shadow-md transition"
        >
          <div className="relative h-40 w-full mb-2">
            <Image
              src={item.imageSrc || "/products/placeholder.webp"}
              alt={item.name}
              fill
              className="object-contain"
            />
          </div>

          <div className="text-sm font-semibold line-clamp-2">
            {item.name}
          </div>

          <div className="mt-2 text-blue-700 font-bold">
            GH₵ {Number(item.retailPrice).toFixed(2)}
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between gap-2">
  
  <Link
    href={`/product/${item.slug}`}
    className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition"
  >
    View
  </Link>

  <AddToCartButton
    product={{
      id: item.id,
      name: item.name,
      slug: item.slug,
      retailPrice: Number(item.retailPrice),
      imageSrc: item.imageSrc,
      stockQty: item.stockQty,
    }}
    outOfStock={item.stockQty <= 0}
  />

</div>
        </div>
      ))}
      
    </div>
  </div>
)}
{/* STICKY WHATSAPP BAR */}
<div className="fixed bottom-0 left-0 w-full bg-white border-t p-3 z-50">
  <a
    href={`https://wa.me/233246011773?text=${encodeURIComponent(
      `Hello, I want to order:
Product: ${product.name}
Price: GH₵ ${price.toFixed(2)}
Quantity: 1

Please assist me with delivery.`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
className="block w-full bg-green-600 text-white text-center py-1.5 rounded-xl font-semibold text-sm shadow-md"  >
    Order via WhatsApp
  </a>
</div>
    </div>
  );
  
}
