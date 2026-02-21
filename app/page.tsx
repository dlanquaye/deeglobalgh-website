import { prisma } from "@/app/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await prisma.product.findMany({
    take: 12,
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