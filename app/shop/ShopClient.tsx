"use client";

import ProductCard from "@/app/components/ProductCard";

export default function ShopClient({ products }: any) {
  return (
    <div className="p-6">

      <h1 className="text-xl font-bold">Shop</h1>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-6">No products found.</p>
      )}
    </div>
  );
}