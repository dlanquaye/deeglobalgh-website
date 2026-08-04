import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  let products: any[] = [];

  try {
    const data = await prisma.product.findMany({
      where: {
        isActive: true,
        websiteVisible: true,
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        retailPrice: true,
        imageSrc: true,
        stockQty: true,
      },
    });

    products = data || [];
  } catch (error) {
    console.error("Database error:", error);
    products = [];
  }

  return <HomeClient products={products} />;
}