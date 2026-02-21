import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const runtime = "nodejs";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default async function Home() {
  // Pull latest 8 products from DB
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const categories = [
    { name: "Textbooks", desc: "Pre-School to SHS" },
    { name: "JHS Combined Edition Textbooks", desc: "JHS 1–3 combined books" },
    { name: "SHS Combined Edition Textbooks", desc: "SHS 1–3 combined books" },
    {
      name: "Exam Past Questions",
      desc: "BECE & WASSCE",
      href: "/category/exam-past-questions",
    },
    { name: "Exam Materials", desc: "BECE & WASSCE" },
    { name: "School Essentials", desc: "Stationery & supplies" },
    { name: "Dormitory Essentials", desc: "Boarding student items" },
    {
      name: "Uniforms & Clothing Essentials",
      desc: "Underwear, socks & uniforms",
    },
    { name: "Drawing & Technical", desc: "Drawing boards & sets" },
    { name: "Bags & Lunch Packs", desc: "Bags, lunch boxes, bottles" },
    { name: "Calculators", desc: "Scientific calculators" },
  ];

  const levels = [
    "Pre-School",
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "JHS 1",
    "JHS 2",
    "JHS 3",
    "SHS 1",
    "SHS 2",
    "SHS 3",
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border bg-gray-50 p-6">
          <h1 className="text-2xl font-bold">
            Shop Textbooks, Stationery & School Essentials in Ghana
          </h1>
          <p className="mt-2 text-gray-700">
            Fast delivery. Secure checkout. Easy shopping for parents and students.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 font-extrabold text-white hover:opacity-90"
            >
              Shop All Products
            </Link>

            <a
              href="https://wa.me/233246011773"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-5 py-3 font-extrabold text-blue-950 hover:opacity-90"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Featured Products</h2>

          <Link
            href="/shop"
            className="text-sm font-bold text-blue-900 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const imageSrc =
              p.imageSrc ?? "/products/placeholder.webp";

            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="rounded-2xl border bg-white p-4 hover:bg-gray-50"
              >
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-gray-50">
                  <Image
                    src={imageSrc}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-contain p-3"
                  />
                </div>

                <div className="mt-3 font-semibold">{p.name}</div>

                <div className="mt-1 text-lg font-extrabold text-blue-900">
                  GH₵ {p.retailPrice}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold">Shop by Category</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const slug = slugify(c.name);
            const href = (c as any).href || `/shop?category=${slug}`;

            return (
              <Link
                key={c.name}
                href={href}
                className="rounded-2xl border p-5 hover:bg-gray-50"
              >
                <div className="text-lg font-semibold">{c.name}</div>
                <div className="mt-1 text-sm text-gray-600">{c.desc}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SHOP BY LEVEL */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold">Shop by School Level</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          {levels.map((level) => {
            const slug = slugify(level);

            return (
              <Link
                key={level}
                href={`/shop?level=${slug}`}
                className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                {level}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
