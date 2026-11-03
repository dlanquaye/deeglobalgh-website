import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DeeGlobalGH | Textbooks, Stationery & School Essentials in Kasoa",
  description:
    "Shop NaCCA and GES curriculum-aligned textbooks, stationery, school bags, exam materials and boarding essentials at DeeGlobalGH, Kasoa New Market, Ghana.",
  alternates: {
    canonical: "https://www.shopdeeglobalgh.com/",
  },
};
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