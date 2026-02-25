import { prisma } from "@/lib/prisma";
import EditProductForm from "./EditProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("ID VALUE:", id);

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} />;
}