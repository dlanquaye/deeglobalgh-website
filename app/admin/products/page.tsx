import { prisma } from "@/app/lib/prisma";
import AdminProductsPage from "./AdminProductsClient";

export default async function Page() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AdminProductsPage initialProducts={products} />;
}
