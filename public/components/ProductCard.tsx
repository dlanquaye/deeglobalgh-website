import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card-brand overflow-hidden">
      <div className="bg-white">
        <div className="flex h-44 items-center justify-center bg-[color:var(--bg-soft)]">
          <img
            src={product.image}
            alt={product.name}
            className="h-40 w-auto object-contain"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm font-semibold text-[color:var(--text-main)]">
          {product.name}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-base font-bold text-[color:var(--brand-blue)]">
            GH₵ {product.price}
          </div>

          <button className="btn-primary !px-4 !py-2 text-sm">Add to cart</button>
        </div>
      </div>
    </div>
  );
}
