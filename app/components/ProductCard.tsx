import Image from "next/image";
import type { Product } from "@/app/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const imageSrc = product?.image?.src || "/products/placeholder.webp";
  const imageAlt = product?.image?.alt || product?.name || "DeeglobalGh product";
  const imageTitle = product?.image?.title || product?.name || "Product image";

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      {/* Image box */}
      <div className="p-4 pb-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border">
          <Image
            src={imageSrc}
            alt={imageAlt}
            title={imageTitle}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-contain p-4"
          />
        </div>
      </div>

      {/* Product details */}
      <div className="p-4">
        <div className="text-sm font-semibold text-gray-900 leading-snug">
          {product.name}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-base font-extrabold text-blue-900 whitespace-nowrap">
            GH₵ {product.price}
          </div>

          <button className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 whitespace-nowrap">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
