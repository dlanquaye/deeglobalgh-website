export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ToggleActiveButton from "./ToggleActiveButton";

type Props = {
  searchParams?: {
    status?: string;
    q?: string;
    page?: string;
  };
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
  status?: string;
  q?: string;
  page?: string;
}>;

}) {
  const params = await searchParams;

  const status = params.status;
  const q = params.q?.trim() || "";

  const page = Number(params.page || "1");
const PAGE_SIZE = 20;
  

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
  skip: (page - 1) * PAGE_SIZE,
  take: PAGE_SIZE,
});

const totalProducts = await prisma.product.count({
  where: whereClause,
});

const activeProducts = await prisma.product.count({
  where: { isActive: true },
});

const inactiveProducts = await prisma.product.count({
  where: { isActive: false },
});

const lowStockProducts = await prisma.product.count({
  where: {
    stockQty: {
      lte: 3,
      gt: 0,
    },
  },
});

const outOfStockProducts = await prisma.product.count({
  where: {
    stockQty: 0,
  },
});

const lowStockItems = await prisma.product.findMany({
  where: {
    stockQty: {
      lte: 3,
    },
  },
  orderBy: {
    stockQty: "asc",
  },
  take: 10,
});

const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-900">
        Admin • Products
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">Total Products</p>
    <p className="mt-2 text-3xl font-bold text-blue-900">
      {totalProducts}
    </p>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">Active Products</p>
    <p className="mt-2 text-3xl font-bold text-green-600">
      {activeProducts}
    </p>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">Inactive Products</p>
    <p className="mt-2 text-3xl font-bold text-red-600">
      {inactiveProducts}
    </p>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">Low Stock</p>
    <p className="mt-2 text-3xl font-bold text-orange-500">
      {lowStockProducts}
    </p>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">Out of Stock</p>
    <p className="mt-2 text-3xl font-bold text-red-700">
      {outOfStockProducts}
    </p>
  </div>

  <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-xl font-bold text-orange-800">
      ⚠ Low Stock Alert
    </h2>

    <span className="rounded-full bg-orange-200 px-3 py-1 text-sm font-semibold text-orange-800">
      {lowStockItems.length} Showing
    </span>
  </div>

  {lowStockItems.length === 0 ? (
    <p className="text-green-700">
      Excellent! No products are currently running low on stock.
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">SKU</th>
            <th className="py-2 text-left">Product</th>
            <th className="py-2 text-left">Stock</th>
            <th className="py-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {lowStockItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-3">{item.sku}</td>

              <td className="py-3 font-medium">
                {item.name}
              </td>

              <td className="py-3 font-bold">
                {item.stockQty}
              </td>

              <td className="py-3">
                {item.stockQty === 0 ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    OUT OF STOCK
                  </span>
                ) : (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                    LOW STOCK
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
</div>

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
  Showing page {page} of {totalPages || 1} ({totalProducts} products)
</p>

      <form method="GET" className="mt-4 flex gap-3">
  <input
    type="text"
    name="q"
    defaultValue={q}
    placeholder="Search by product name, SKU or slug..."
    className="flex-1 rounded-xl border px-4 py-3"
  />

  {status && (
    <input
      type="hidden"
      name="status"
      value={status}
    />
  )}

  <button
    type="submit"
    className="rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800"
  >
    Search
  </button>
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

              <div className="mt-8 flex items-center justify-between">
  <div>
    {page > 1 && (
      <Link
        href={`/admin/products?page=${page - 1}${
          status ? `&status=${status}` : ""
        }${q ? `&q=${encodeURIComponent(q)}` : ""}`}
        className="rounded-xl border px-4 py-2 hover:bg-gray-100"
      >
        ← Previous
      </Link>
    )}
  </div>

  <div className="text-sm text-gray-600">
    Page {page} of {totalPages || 1}
  </div>

  <div>
    {page < totalPages && (
      <Link
        href={`/admin/products?page=${page + 1}${
          status ? `&status=${status}` : ""
        }${q ? `&q=${encodeURIComponent(q)}` : ""}`}
        className="rounded-xl border px-4 py-2 hover:bg-gray-100"
      >
        Next →
      </Link>
    )}
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