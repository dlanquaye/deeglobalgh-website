import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

async function main() {
  const products = await prisma.product.findMany({
    select: {
      name: true,
      slug: true,
    },
  });

  const baseUrl = "https://shopdeeglobalgh.com/product/";

  const result = products.map((p) => ({
    name: p.name,
    slug: p.slug,
    url: baseUrl + p.slug,
  }));

  const filePath = path.join(process.cwd(), "products.csv");

  const csv = [
    ["Name", "Slug", "URL"],
    ...result.map((p) => [p.name, p.slug, p.url]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  fs.writeFileSync(filePath, csv);

  console.log("CSV exported to products.csv");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());