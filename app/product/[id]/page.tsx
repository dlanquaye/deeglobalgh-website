import Link from "next/link";
import { products } from "../../lib/products";
;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-gray-700">
          Sorry, this product does not exist.
        </p>

        <Link href="/shop" className="mt-4 inline-block underline">
          Back to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-3 text-sm">
  <Link href="/" className="underline">
    Home
  </Link>
  <span className="text-gray-400">/</span>
  <Link href="/shop" className="underline">
    Shop
  </Link>
  <span className="text-gray-400">/</span>
  <span className="text-gray-600">Product</span>
</div>


      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex h-96 items-center justify-center rounded-xl bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="h-80 w-auto object-contain"
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="mt-2 text-xl font-bold">GH₵ {product.price}</div>

          <p className="mt-4 text-gray-700">
            Available for delivery. Send us a message on WhatsApp to order.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
         href={`https://wa.me/233246011773?text=${encodeURIComponent(
  `Hello DeeGlobalGH, I want to order:\n\n• Product: ${product.name}\n• Price: GH₵ ${product.price}\n• Product ID: ${product.id}\n• Link: http://localhost:3000/product/${product.id}\n\nSOURCE: DG-WEBSITE`
)}`}


              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90"
            >
              Order on WhatsApp
            </a>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
            {/* Related Products */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-blue-900">Related Products</h2>
        <p className="mt-2 text-sm text-gray-700">
          You may also like these items.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products
            .filter((x) => x.id !== product.id)
            .slice(0, 3)
            .map((rp) => (
              <Link
                key={rp.id}
                href={`/product/${rp.id}`}
                className="rounded-2xl border bg-white p-4 hover:bg-gray-50"
              >
                <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50">
                  <img
                    src={rp.image}
                    alt={rp.name}
                    className="h-48 w-auto object-contain"
                  />
                </div>

                <div className="mt-3 font-semibold">{rp.name}</div>
                <div className="mt-1 font-bold text-lg">GH₵ {rp.price}</div>

                <div className="mt-3 w-full rounded-xl bg-yellow-500 px-4 py-3 text-center font-extrabold text-blue-950">
                  View Product
                </div>
              </Link>
            ))}
        </div>
      </section>

    </main>
  );
}
