import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import CategoryClient from "./CategoryClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${slug.replace(/-/g, " ")} | DeeglobalGh`,
    description: `Shop ${slug.replace(/-/g, " ")} at DeeglobalGh.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const products = await prisma.product.findMany({
    where: { categorySlug: slug },
    orderBy: { createdAt: "desc" },
  });

  return <CategoryClient slug={slug} products={products} />;
}
