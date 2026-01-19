import Link from "next/link";
import type { Metadata } from "next";
import { products } from "@/app/lib/products";
import AddToCartButton from "./AddToCartButton";

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = "https://deeglobalgh.com";

function normalizeImageSrc(src?: string) {
  if (!src) return "/products/placeholder.webp";
  return src.startsWith("/") ? src : `/${src}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product not found | DeeglobalGh",
      description: "Sorry, this product does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const title = product.seo?.metaTitle || `${product.name} | DeeglobalGh`;

  const description =
    product.seo?.metaDescription ||
    `Buy ${product.name} in Ghana from DeeglobalGh. Available for delivery.`;

  const canonicalUrl = `${SITE_URL}/product/${product.slug}`;

  const imageSrc = normalizeImageSrc(product.image?.src);
  const imageUrl = `${SITE_URL}${imageSrc}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: product.seo?.socialTitle || title,
      description: product.seo?.socialDescription || description,
      images: [
        {
          url: imageUrl,
          alt: product.image?.alt || product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo?.socialTitle || title,
      description: product.seo?.socialDescription || description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <main className="py-6">
        <section className="card-brand p-6">
          <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
            Product not found
          </h1>
          <p className="mt-2 text-[color:var(--text-muted)]">
            Sorry, this product does not exist.
          </p>

          <Link
            href="/shop"
            className="btn-outline mt-4 inline-flex items-center justify-center px-5 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
          >
            Back to Shop
          </Link>
        </section>
      </main>
    );
  }

  const imageSrc = normalizeImageSrc(product.image?.src);
  const imageAlt = product.image?.alt || product.name || "DeeglobalGh product";
  const imageTitle = product.image?.title || product.name || "Product image";

  const productUrl = `${SITE_URL}/product/${product.slug}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [`${SITE_URL}${imageSrc}`],
    description:
      product.seo?.fullDescription ||
      product.seo?.metaDescription ||
      `Buy ${product.name} in Ghana from DeeglobalGh.`,
    sku: product.id,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: 1,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "GHS",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "GH",
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          currency: "GHS",
          value: 0,
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GH",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
      priceValidUntil: "2026-12-31",
    },
  };

  return (
    <main className="py-6">
      {/* ✅ Product Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <section className="card-brand p-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--text-muted)]">
          <Link href="/" className="hover:underline text-[color:var(--brand-blue)]">
            Home
          </Link>
          <span className="opacity-60">/</span>
          <Link
            href="/shop"
            className="hover:underline text-[color:var(--brand-blue)]"
          >
            Shop
          </Link>
          <span className="opacity-60">/</span>
          <span className="text-[color:var(--text-main)] font-semibold">
            {product.name}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Image */}
          <div className="card-brand p-4">
            <div className="flex h-[360px] sm:h-[420px] lg:h-[520px] w-full items-center justify-center overflow-hidden rounded-2xl border bg-white">
              <img
                src={imageSrc}
                alt={imageAlt}
                title={imageTitle}
                loading="lazy"
                className="max-h-full max-w-full object-contain p-4"
              />
            </div>

            {product.image?.caption ? (
              <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                {product.image.caption}
              </p>
            ) : null}
          </div>

          {/* Info */}
          <div className="card-brand p-6">
            <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
              {product.name}
            </h1>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue-soft)] px-4 py-2 text-sm font-extrabold text-[color:var(--brand-blue)]">
              Product Code: {product.id}
            </div>

            <div className="mt-4 text-2xl font-extrabold text-[color:var(--brand-blue)]">
              GH₵ {product.price}
            </div>

            {product.seo?.shortSummary ? (
              <p className="mt-4 text-[color:var(--text-muted)]">
                {product.seo.shortSummary}
              </p>
            ) : (
              <p className="mt-4 text-[color:var(--text-muted)]">
                Available for delivery. Send us a message on WhatsApp to order.
              </p>
            )}

            {/* ✅ Cart CTA */}
            <AddToCartButton product={product} />

            {/* WhatsApp + Continue */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/233246011773?text=${encodeURIComponent(
                  `Hello DeeglobalGh, I want to order:\n\n• Product: ${product.name}\n• Product Code: ${product.id}\n• Price: GH₵ ${product.price}\n• Link: ${productUrl}\n\nSOURCE: DG-WEBSITE`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-black px-5 py-3 font-extrabold text-white hover:opacity-90"
              >
                Order on WhatsApp
              </a>

              <Link
                href="/shop"
                className="btn-outline inline-flex flex-1 items-center justify-center px-5 py-3 text-[color:var(--brand-blue)] hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Trust line */}
            <div className="mt-5 rounded-2xl border bg-white p-4 text-sm text-[color:var(--text-muted)]">
              Fast delivery across Kasoa and nearby areas. Confirm delivery fee on
              WhatsApp.
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[color:var(--brand-blue)]">
                Related Products
              </h2>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                You may also like these items.
              </p>
            </div>

            <Link
              href="/shop"
              className="text-sm font-extrabold text-[color:var(--brand-blue)] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((x) => x.id !== product.id)
              .sort((a, b) => {
                const aScore = a.categorySlug === product.categorySlug ? 1 : 0;
                const bScore = b.categorySlug === product.categorySlug ? 1 : 0;
                return bScore - aScore;
              })
              .slice(0, 3)
              .map((rp) => {
                const rpImageSrc = normalizeImageSrc(rp.image?.src);
                const rpImageAlt = rp.image?.alt || rp.name || "Product image";
                const rpImageTitle = rp.image?.title || rp.name || "Product";

                return (
                  <Link
                    key={rp.id}
                    href={`/product/${rp.slug}`}
                    className="card-brand p-4 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex h-52 items-center justify-center overflow-hidden rounded-2xl border bg-white">
                      <img
                        src={rpImageSrc}
                        alt={rpImageAlt}
                        title={rpImageTitle}
                        className="h-48 w-auto object-contain p-2"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-4 font-semibold text-[color:var(--text-main)]">
                      {rp.name}
                    </div>

                    <div className="mt-1 font-extrabold text-lg text-[color:var(--brand-blue)]">
                      GH₵ {rp.price}
                    </div>

                    <div className="mt-4 w-full rounded-2xl bg-[color:var(--brand-yellow)] px-4 py-3 text-center font-extrabold text-blue-950 hover:opacity-90">
                      View Product
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
