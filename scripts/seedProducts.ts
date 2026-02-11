console.log("SEED SCRIPT STARTED");

import { PrismaClient } from "@prisma/client";
import { products } from "../app/lib/products";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting product seed...");

  for (const product of products) {
    try {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {}, // do not overwrite existing for now
        create: {
          sku: product.id, // DG0001 becomes SKU
          name: product.name,
          slug: product.slug,

          retailPrice: product.price,
          wholesalePrice: null,
          distributorPrice: null,

          stockQty: product.stockQty ?? 0,
          lowStockThreshold: product.lowStockThreshold ?? 3,

          categorySlug: product.categorySlug,
          levelSlugs: product.levelSlugs ?? [],

          imageSrc: product.image.src,
          imageAlt: product.image.alt,
          imageTitle: product.image.title ?? null,
          imageCaption: product.image.caption ?? null,
          imageDescription: product.image.description ?? null,

          focusKeyphrase: product.seo?.focusKeyphrase ?? null,
          metaTitle: product.seo?.metaTitle ?? null,
          metaDescription: product.seo?.metaDescription ?? null,
          socialTitle: product.seo?.socialTitle ?? null,
          socialDescription: product.seo?.socialDescription ?? null,
          shortSummary: product.seo?.shortSummary ?? null,
          fullDescription: product.seo?.fullDescription ?? null,
          brand: product.seo?.brand ?? null,
          tags: product.seo?.tags ?? [],
        },
      });

      console.log(`Seeded: ${product.slug}`);
    } catch (error) {
      console.error(`Failed to seed ${product.slug}`, error);
    }
  }

  console.log("Product seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
