import { prisma } from "@/lib/prisma";

async function main() {
  const products = await prisma.product.findMany({
    select: {
      categorySlug: true,
      subCategorySlug: true,
      brand: true,
    },
  });

  const categorySlugs = [...new Set(products.map(p => p.categorySlug).filter(Boolean))].sort();
  const subCategorySlugs = [...new Set(products.map(p => p.subCategorySlug).filter(Boolean))].sort();
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

  console.log("\n=== CATEGORY SLUGS ===");
  console.log(categorySlugs);

  console.log("\n=== SUBCATEGORY SLUGS ===");
  console.log(subCategorySlugs);

  console.log("\n=== BRANDS ===");
  console.log(brands);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });