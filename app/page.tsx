import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await prisma.product.findMany({
  where: { isActive: true },
  take: 8,
  orderBy: { createdAt: "desc" },

  select: {
    id: true,
    name: true,
    slug: true,
    retailPrice: true,
    imageSrc: true,
    stockQty: true,
  },
});

  return <HomeClient products={products} />;
}