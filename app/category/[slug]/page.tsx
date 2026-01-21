import type { Metadata } from "next";
import { products } from "../../lib/products";
import CategoryClient from "./CategoryClient";

const SITE_URL = "https://deeglobalgh.com";

function prettifySlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const pretty = prettifySlug(slug);

  const title = `${pretty} | DeeglobalGh`;
  const description = `Shop ${pretty} in Ghana. Order from DeeglobalGh for fast delivery in Kasoa and beyond.`;

  const canonicalUrl = `${SITE_URL}/category/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ✅ Special landing page: Exam Past Questions
  if (slug === "exam-past-questions") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Exam Past Questions</h1>

        <p className="mt-2 text-gray-700">
          Shop verified Past Questions for BECE and WASSCE. Order from{" "}
          <span className="font-semibold">DeeglobalGh</span> for fast delivery in Kasoa and beyond.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href="/category/jhs-past-questions"
            className="rounded-2xl border bg-white p-6 hover:bg-gray-50"
          >
            <div className="text-lg font-bold">JHS Past Questions</div>
            <div className="mt-2 text-gray-700">BECE Past Questions for JHS students.</div>
            <div className="mt-4 inline-flex rounded-xl bg-black px-4 py-3 font-semibold text-white">
              View JHS Past Questions
            </div>
          </a>

          <a
            href="/category/shs-past-questions"
            className="rounded-2xl border bg-white p-6 hover:bg-gray-50"
          >
            <div className="text-lg font-bold">SHS Past Questions</div>
            <div className="mt-2 text-gray-700">WASSCE Past Questions for SHS students.</div>
            <div className="mt-4 inline-flex rounded-xl bg-black px-4 py-3 font-semibold text-white">
              View SHS Past Questions
            </div>
          </a>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6">
          <div className="text-lg font-bold">Need help choosing?</div>
          <p className="mt-2 text-gray-700">
            Use the WhatsApp Live Chat button to ask us questions before you buy.
          </p>
        </div>
      </main>
    );
  }

  // ✅ Normal categories use the Client component (real add to cart)
  return <CategoryClient slug={slug} products={products} />;
}
