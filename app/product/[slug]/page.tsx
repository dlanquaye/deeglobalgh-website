import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import AddToCartButton from "./AddToCartButton";

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = "https://shopdeeglobalgh.com";

function normalizeImageSrc(src?: string | null) {
  if (!src) return "/products/placeholder.webp";
  return src.startsWith("/") ? src : `/${src}`;
}

/* ===============================
   GENERATE METADATA (SEO)
================================ */
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return {
      title: "Product not found | DeeglobalGh",
      description: "Sorry, this product does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const title =
    product.metaTitle || `${product.name} | DeeglobalGh`;

  const description =
    product.metaDescription ||
    `Buy ${product.name} in Ghana from DeeglobalGh. Available for delivery.`;

  const canonicalUrl = `${SITE_URL}/product/${product.slug}`;
  const imageSrc = normalizeImageSrc(product.imageSrc);
  const imageUrl = `${SITE_URL}${imageSrc}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: product.socialTitle || title,
      description: product.socialDescription || description,
      images: [
        {
          url: imageUrl,
          alt: product.imageAlt || product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.socialTitle || title,
      description: product.socialDescription || description,
      images: [imageUrl],
    },
  };
}

/* ===============================
   PRODUCT PAGE
================================ */
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
      categorySlug: product.categorySlug,
    },
    take: 3,
  });

  const imageSrc = normalizeImageSrc(product.imageSrc);
  const imageAlt = product.imageAlt || product.name;
  const imageTitle = product.imageTitle || product.name;
  const productUrl = `${SITE_URL}/product/${product.slug}`;

  const displaySku = product.sku || "N/A";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [`${SITE_URL}${imageSrc}`],
    description:
      product.metaDescription ||
      `Buy ${product.name} in Ghana from DeeglobalGh.`,
    sku: product.sku, // ✅ Correct
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "GHS",
      price: product.retailPrice,
      availability:
        product.stockQty > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="py-6">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <section className="card-brand p-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--text-muted)]">
          <Link href="/" className="hover:underline text-[color:var(--brand-blue)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:underline text-[color:var(--brand-blue)]">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-[color:var(--text-main)]">
            {product.name}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* IMAGE */}
          <div className="card-brand p-4">
            <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-2xl border bg-white">
              <img
                src={imageSrc}
                alt={imageAlt}
                title={imageTitle}
                loading="lazy"
                className="max-h-full max-w-full object-contain p-4"
              />
            </div>
          </div>

          {/* INFO */}
          <div className="card-brand p-6">
            <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
              {product.name}
            </h1>

            {/* ✅ SKU DISPLAY FIXED */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue-soft)] px-4 py-2 text-sm font-extrabold text-[color:var(--brand-blue)]">
              Product Code: {displaySku}
            </div>

            <div className="mt-4 text-2xl font-extrabold text-[color:var(--brand-blue)]">
              GH₵ {product.retailPrice}
            </div>

            <AddToCartButton
              product={{
                id: product.id, // internal ID stays for cart
                name: product.name,
                slug: product.slug,
                retailPrice: product.retailPrice,
                imageSrc: product.imageSrc,
                stockQty: product.stockQty ?? 0,
              }}
            />

            <div className="mt-5">
              <Link
                href="/shop"
                className="btn-outline inline-flex w-full items-center justify-center px-5 py-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* RELATED */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-[color:var(--brand-blue)]">
            Related Products
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((rp) => {
              const rpImageSrc = normalizeImageSrc(rp.imageSrc);

              return (
                <Link
                  key={rp.id}
                  href={`/product/${rp.slug}`}
                  className="card-brand p-4 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-52 items-center justify-center overflow-hidden rounded-2xl border bg-white">
                    <img
                      src={rpImageSrc}
                      alt={rp.name}
                      className="h-48 w-auto object-contain p-2"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-4 font-semibold text-[color:var(--text-main)]">
                    {rp.name}
                  </div>

                  <div className="mt-1 font-extrabold text-lg text-[color:var(--brand-blue)]">
                    GH₵ {rp.retailPrice}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
