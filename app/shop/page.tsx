import { prisma } from "@/lib/prisma";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
  where: { isActive: true },
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    name: true,
    slug: true,
    retailPrice: true,
    stockQty: true,
    imageSrc: true,
    imageAlt: true,
    imageTitle: true,
    categorySlug: true,
    levelSlugs: true,
},
  });

  return <ShopClient products={products} />;
}