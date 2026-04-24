"use client";

import ProductCard from "@/app/components/ProductCard";

export default function ShopClient({ products }: any) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Shop</h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-semibold text-gray-700">
            No products found.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try searching with different keywords or browse other categories.
          </p>

          <a
            href="/shop"
            className="inline-block mt-4 bg-blue-900 text-white px-4 py-2 rounded-lg"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}