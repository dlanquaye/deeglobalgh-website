import Link from "next/link";
import { products } from "../../lib/products";

export default async function LevelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const pretty = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const filtered = products.filter((p) => p.levelSlug === slug);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">{pretty}</h1>

      <p className="mt-2 text-gray-700">
  Showing products for <span className="font-semibold">{pretty}</span>.
</p>

<p className="mt-2 text-sm text-gray-600">
  Found <span className="font-semibold">{filtered.length}</span> product
  {filtered.length === 1 ? "" : "s"} in this level.
</p>


      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="rounded-2xl border bg-white p-4 hover:bg-gray-50"
            >
              <div className="flex h-52 items-center justify-center rounded-xl bg-gray-50">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-48 w-auto object-contain"
                />
              </div>

              <div className="mt-3 font-semibold">{p.name}</div>
              <div className="mt-1 font-bold text-lg">GH₵ {p.price}</div>

              <div className="mt-3 w-full rounded-xl bg-black px-4 py-3 text-center font-semibold text-white">
                Add to cart
              </div>
            </Link>
          ))
        ) : (
          <div className="mt-6 rounded-2xl border bg-white p-6 text-gray-700">
            No products found for this level yet.
          </div>
        )}
      </div>
    </main>
  );
}
