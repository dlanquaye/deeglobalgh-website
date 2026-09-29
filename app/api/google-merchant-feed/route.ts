import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.shopdeeglobalgh.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\?\?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      websiteVisible: true,
      retailPrice: {
        gt: 0,
      },
    },
    select: {
      sku: true,
      name: true,
      slug: true,
      retailPrice: true,
      stockQty: true,
      imageSrc: true,
      shortSummary: true,
      fullDescription: true,
      metaDescription: true,
      brand: true,
    },
    orderBy: {
      sku: "asc",
    },
  });

  const items = products
    .filter(
      (product) =>
        product.sku.trim() &&
        product.name.trim() &&
        product.slug.trim() &&
        product.imageSrc.trim()
    )
    .map((product) => {
      const description = stripHtml(
        product.fullDescription ||
          product.shortSummary ||
          product.metaDescription ||
          product.name
      );

      const productUrl = `${SITE_URL}/product/${product.slug}`;
      const imageUrl = absoluteUrl(product.imageSrc);
      const availability =
        product.stockQty > 0 ? "in_stock" : "out_of_stock";

      return `
    <item>
      <g:id>${escapeXml(product.sku.trim())}</g:id>
      <title>${escapeXml(product.name.trim())}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(productUrl)}</link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${product.retailPrice.toFixed(2)} GHS</g:price>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml((product.brand || "").trim())}</g:brand>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>DeeGlobalGH Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Live product catalogue from DeeGlobalGH, Kasoa, Ghana.</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
