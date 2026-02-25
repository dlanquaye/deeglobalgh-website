import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-900">
        Admin • Products
      </h1>

      <div className="mt-6">
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-blue-900 px-4 py-3 font-bold text-white hover:opacity-90"
        >
          + Create New Product
        </Link>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Showing {products.length} products.
      </p>

      <div className="mt-6 space-y-4">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-bold text-blue-900">
                  {p.sku} • {p.name}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Slug: {p.slug}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Stock: {p.stockQty}
                </div>
              </div>

              <div className="text-lg font-extrabold text-blue-900">
                GH₵ {p.retailPrice}
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/admin/products/${p.id}`}
                className="inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold hover:bg-gray-50"
              >
                Edit Product
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}