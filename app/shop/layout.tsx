import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products | DeeglobalGh",
  description:
    "Browse textbooks, school essentials, and exam materials. Order from DeeglobalGh for fast delivery in Kasoa and across Ghana.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://shopdeeglobalgh.com/shop",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
