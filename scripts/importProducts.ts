import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const results: any[] = [];

async function main() {
  console.log("🚀 Starting import...");

  fs.createReadStream("products.csv") // <-- make sure file name matches
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`📦 Loaded ${results.length} rows`);

      for (const row of results) {
        try {
          // 🔒 VALIDATION
          if (!row.slug || !row.name) {
            console.log(`⛔ Skipped (missing slug/name): ${row.name}`);
            continue;
          }

          await prisma.product.create({
            data: {
              sku: row.sku,
              name: row.name,
              slug: row.slug,
              brand: row.brand,

              retailPrice: Number(row.retailPrice) || 0,
              wholesalePrice: Number(row.wholesalePrice) || 0,
              distributorPrice: Number(row.distributorPrice) || 0,

              stockQty: Number(row.stockQty) || 0,
              lowStockThreshold: Number(row.lowStockThreshold) || 0,

              categorySlug: row.categorySlug,
              levelSlugs: row.levelSlugs
                ? row.levelSlugs.split(",").map((l: string) => l.trim())
                : [],

              imageSrc: row.imageSrc,
imageAlt: row.imageAlt,
imageTitle: row.imageTitle,
imageCaption: row.imageCaption,
imageDescription: row.imageDescription,

              focusKeyphrase: row.focusKeyphrase,
metaTitle: row.metaTitle,
metaDescription: row.metaDescription,
socialTitle: row.socialTitle,
socialDescription: row.socialDescription,

              shortSummary: row.shortSummary,
              fullDescription: row.fullDescription,

              tags: row.tags
                ? row.tags.split(",").map((t: string) => t.trim())
                : [],
            },
          });

          console.log(`✅ Imported: ${row.name}`);
        } catch (error) {
          console.log(`❌ Failed: ${row.name}`);
          console.error(error);
        }
      }

      console.log("🎉 Import completed");
      await prisma.$disconnect();
    });
}

main();