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
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      websiteVisible: true,
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      websiteVisible: true,
      id: {
        not: product.id,
      },
      categorySlug: product.categorySlug,
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
      websiteVisible: true,
      OR: [
        {
          name: {
            contains: "exercise",
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: "pen",
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: "set",
            mode: "insensitive",
          },
        },
      ],
    },
    take: 3,
  });

  const cedi = "GH\u20B5";
  const approvedIcon = "\u2714";
  const deliveryIcon = "\u{1F69A}";
  const packageIcon = "\u{1F4E6}";
  const whatsappIcon = "\u{1F4AC}";

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

        <div className="rounded-2xl border bg-gray-50 p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            {product.name}
          </h1>

          {product.stockQty > 0 &&
            product.stockQty <= 5 && (
              <p className="mt-2 text-sm font-semibold text-red-600">
                Only few left in stock
              </p>
            )}

          {product.stockQty <= 0 && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              Out of stock
            </p>
          )}

          {product.author && (
            <div className="mt-2 text-sm text-gray-600">
              Author: {product.author}
            </div>
          )}

          {product.sku && (
            <div className="mt-3 text-sm font-semibold">
              Product Code: {product.sku}
            </div>
          )}

          <div className="mt-5 text-2xl font-bold">
            {cedi} {price.toFixed(2)}
          </div>

          {product.shortSummary && (
            <p className="mt-4">
              {product.shortSummary}
            </p>
          )}

          <div className="mt-6 space-y-2 rounded-xl border bg-white p-4 text-sm">
            <p>
              {approvedIcon} 100% New Curriculum
              (NaCCA Approved)
            </p>

            <p>
              {deliveryIcon} Fast and reliable
              delivery in Kasoa, Accra &amp; nationwide
            </p>

            <p>
              {packageIcon} Carefully packed to
              avoid damage
            </p>

            <p>
              {whatsappIcon} Order directly via
              WhatsApp for quick response
            </p>
          </div>

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

          <a
            href={`https://wa.me/233270030000?text=${encodeURIComponent(
              `Hello, I want to order:
Product: ${product.name}
Price: ${cedi} ${price.toFixed(2)}
Quantity: 1

Please assist me with delivery.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-xl bg-yellow-500 px-5 py-3 text-center font-bold text-black"
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

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-4 text-xl font-semibold">
            Frequently Bought Together
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-4"
              >
                <div className="relative mb-3 h-40 w-full">
                  <Image
                    src={
                      item.imageSrc ||
                      "/products/placeholder.webp"
                    }
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="line-clamp-2 min-h-[40px] text-xs font-semibold leading-tight md:text-sm">
                  {item.name}
                </div>

                <div className="mt-1 text-lg font-bold text-[color:var(--brand-blue)]">
                  {cedi}{" "}
                  {Number(item.retailPrice).toFixed(2)}
                </div>

                <Link
                  href={`/product/${item.slug}`}
                  className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {bundleItems.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-4 text-xl font-semibold">
            You May Also Need
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {bundleItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border bg-white p-4 transition hover:shadow-md"
              >
                <div className="relative mb-2 h-40 w-full">
                  <Image
                    src={
                      item.imageSrc ||
                      "/products/placeholder.webp"
                    }
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="line-clamp-2 text-sm font-semibold">
                  {item.name}
                </div>

                <div className="mt-2 font-bold text-blue-700">
                  {cedi}{" "}
                  {Number(item.retailPrice).toFixed(2)}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <Link
                    href={`/product/${item.slug}`}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    View
                  </Link>

                  <AddToCartButton
                    product={{
                      id: item.id,
                      name: item.name,
                      slug: item.slug,
                      retailPrice: Number(
                        item.retailPrice
                      ),
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

      <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-white p-3">
        <a
          href={`https://wa.me/233270030000?text=${encodeURIComponent(
            `Hello, I want to order:
Product: ${product.name}
Price: ${cedi} ${price.toFixed(2)}
Quantity: 1

Please assist me with delivery.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-green-600 py-1.5 text-center text-sm font-semibold text-white shadow-md"
        >
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}
