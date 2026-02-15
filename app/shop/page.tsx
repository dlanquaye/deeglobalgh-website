import { prisma } from "@/app/lib/prisma";
import ShopClient from "./ShopClient";

export const runtime = "nodejs";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ShopClient products={products} />;
}
