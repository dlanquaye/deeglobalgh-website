export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ToggleActiveButton from "./ToggleActiveButton";

type Props = {
  searchParams?: {
    status?: string;
    q?: string;
  };
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const status = params.status;
  const q = params.q?.trim() || "";
  

  const whereClause = {
  ...(status === "active"
    ? { isActive: true }
    : status === "inactive"
    ? { isActive: false }
    : {}),

  ...(q
    ? {
        OR: [
          {
            name: {
              contains: q,
            },
          },
          {
            sku: {
              contains: q,
            },
          },
          {
            slug: {
              contains: q,
          
            },
          },
        ],
      }
    : {}),
};

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-900">
        Admin • Products
      </h1>

      {/* FILTER LINKS */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/products"
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          All
        </Link>

        <Link
          href="/admin/products?status=active"
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Active
        </Link>

        <Link
          href="/admin/products?status=inactive"
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Inactive
        </Link>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Showing {products.length} products.
      </p>

      <form
  method="GET"
  className="mt-4"
>
  <input
    type="text"
    name="q"
    defaultValue={q}
    placeholder="Search by product name, SKU or slug..."
    className="w-full rounded-xl border px-4 py-3"
  />
</form>

      {/* PRODUCT LIST */}
      <div className="mt-6 space-y-4">
        {products.map((p) => {
          const price = Number(p.retailPrice);

          return (
            <div
              key={p.id}
              className="rounded-2xl border bg-white p-5"
            >
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

                  <div className="mt-2">
                    {p.isActive ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-lg font-extrabold text-blue-900">
                  GH₵ {price.toFixed(2)}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold hover:bg-gray-50"
                >
                  Edit Product
                </Link>

                <ToggleActiveButton
                  id={p.id}
                  isActive={p.isActive}
                />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}