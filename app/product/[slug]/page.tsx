import Link from "next/link";
import type { Metadata } from "next";
import { products } from "@/app/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = "https://deeglobalgh.com";

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
  const imageUrl = `${SITE_URL}${product.image?.src || "/products/placeholder.webp"}`;

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
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-gray-700">Sorry, this product does not exist.</p>

        <Link href="/shop" className="mt-4 inline-block underline">
          Back to Shop
        </Link>
      </main>
    );
  }

  // ✅ Image fields (SEO)
  const imageSrc = product.image?.src || "/products/placeholder.webp";
  const imageAlt = product.image?.alt || product.name || "DeeglobalGh product";
  const imageTitle = product.image?.title || product.name || "Product image";

  const productUrl = `${SITE_URL}/product/${product.slug}`;

  // ✅ Product structured data (JSON-LD for Google)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [imageSrc],
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

      // ✅ Optional but recommended (Merchant Listings)
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
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* ✅ Product Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" className="underline">
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/shop" className="underline">
          Shop
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Image */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex h-96 items-center justify-center rounded-xl bg-gray-50">
            <img
              src={imageSrc}
              alt={imageAlt}
              title={imageTitle}
              className="h-80 w-auto object-contain"
              loading="lazy"
            />
          </div>

          {/* Optional Caption (good SEO + trust) */}
          {product.image?.caption ? (
            <p className="mt-3 text-sm text-gray-600">{product.image.caption}</p>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-900">
            Product Code: {product.id}
          </div>

          <div className="mt-2 text-xl font-bold">GH₵ {product.price}</div>

          {/* ✅ short summary */}
          {product.seo?.shortSummary ? (
            <p className="mt-4 text-gray-700">{product.seo.shortSummary}</p>
          ) : (
            <p className="mt-4 text-gray-700">
              Available for delivery. Send us a message on WhatsApp to order.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/233246011773?text=${encodeURIComponent(
                `Hello DeeglobalGh, I want to order:\n\n• Product: ${product.name}\n• Product Code: ${product.id}\n• Price: GH₵ ${product.price}\n• Link: ${productUrl}\n\nSOURCE: DG-WEBSITE`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90"
            >
              Order on WhatsApp
            </a>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-blue-900">Related Products</h2>
        <p className="mt-2 text-sm text-gray-700">You may also like these items.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products
            .filter((x) => x.id !== product.id)
            .sort((a, b) => {
              const aScore = a.categorySlug === product.categorySlug ? 1 : 0;
              const bScore = b.categorySlug === product.categorySlug ? 1 : 0;
              return bScore - aScore;
            })
            .slice(0, 3)
            .map((rp) => {
              const rpImageSrc = rp.image?.src || "/products/placeholder.webp";
              const rpImageAlt = rp.image?.alt || rp.name || "Product image";
              const rpImageTitle = rp.image?.title || rp.name || "Product";

              return (
                <Link
                  key={rp.id}
                  href={`/product/${rp.slug}`}
                  className="rounded-2xl border bg-white p-4 hover:bg-gray-50"
                >
                  <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50">
                    <img
                      src={rpImageSrc}
                      alt={rpImageAlt}
                      title={rpImageTitle}
                      className="h-48 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-3 font-semibold">{rp.name}</div>
                  <div className="mt-1 font-bold text-lg">GH₵ {rp.price}</div>

                  <div className="mt-3 w-full rounded-xl bg-yellow-500 px-4 py-3 text-center font-extrabold text-blue-950">
                    View Product
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </main>
  );
}
