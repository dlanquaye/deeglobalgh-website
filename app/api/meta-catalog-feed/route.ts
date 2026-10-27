import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.shopdeeglobalgh.com";

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/For curriculum reference,?\s+visit\s*:?\s*https?:\/\/\S+/gi, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/For curriculum reference,?\s+visit\s*:?\s*$/gi, " ")
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

function csv(value: string | number): string {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
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
      id: true,
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
      publisher: true,
      categorySlug: true,
      subCategorySlug: true,
      levelSlugs: true,
      tags: true,
    },
    orderBy: {
      sku: "asc",
    },
  });

  const visibleProducts = products.filter(
    (product) =>
      product.id.trim() &&
      product.name.trim() &&
      product.slug.trim() &&
      product.imageSrc.trim()
  );

  const headers = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
    "product_type",
    "custom_label_0",
    "custom_label_1",
    "custom_label_2",
    "custom_label_3",
    "custom_label_4",
  ];

  const rows = visibleProducts.map((product) => {
    const description = stripHtml(
      product.fullDescription ||
        product.shortSummary ||
        product.metaDescription ||
        product.name
    );

    const productUrl = `${SITE_URL}/product/${product.slug}`;
    const imageUrl = absoluteUrl(product.imageSrc);

    const availability =
      product.stockQty > 0
        ? "in stock"
        : "out of stock";

    const brand =
      product.brand?.trim() ||
      product.publisher?.trim() ||
      "";

    const levels =
      product.levelSlugs.join("|");

    const tags =
      product.tags.join("|");

    return [
      csv(product.id),
      csv(product.name.trim()),
      csv(description),
      csv(availability),
      csv("new"),
      csv(`${product.retailPrice.toFixed(2)} GHS`),
      csv(productUrl),
      csv(imageUrl),
      csv(brand),
      csv(product.categorySlug),
      csv(product.categorySlug),
      csv(product.subCategorySlug || ""),
      csv(levels),
      csv(product.publisher || ""),
      csv(tags),
    ].join(",");
  });

  const body = [
    headers.join(","),
    ...rows,
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'inline; filename="deeglobalgh-meta-catalog.csv"',
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
