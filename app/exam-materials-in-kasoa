export const metadata = {
  title:
    "Exam Materials in Kasoa | BECE & WASSCE Supplies | DeeglobalGh",
  description:
    "Buy exam materials in Kasoa including maths sets, scientific calculators, past questions, and exam essentials for BECE and WASSCE.",
  alternates: {
    canonical: "https://www.shopdeeglobalgh.com/exam-materials-in-kasoa",
  },
};

import { prisma } from "@/lib/prisma";
import ProductCard from "@/app/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ExamMaterialsPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categorySlug: "exam-materials",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-2">
        Buy Exam Materials in Kasoa
      </h1>

      <p className="text-gray-600 mb-6">
        Shop exam essentials for BECE and WASSCE including calculators,
        maths sets, past questions, and answer sheets.
      </p>

      {/* CTA */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <a
          href="https://wa.me/233246011773"
          target="_blank"
          className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
        >
          Order on WhatsApp
        </a>
      </div>

      {/* PRODUCTS */}
      {products.length === 0 ? (
        <p>No exam materials available yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}