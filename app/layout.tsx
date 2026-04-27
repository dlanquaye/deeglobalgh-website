import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header"; // ✅ FIXED PATH

export const metadata: Metadata = {
  title: "DeeglobalGh | Textbooks, School Essentials & Delivery",
  description:
    "Shop textbooks, stationery, and school essentials in Ghana. Fast delivery across Kasoa and beyond.",

  // ✅ Pinterest Verification
  verification: {
    other: {
      "p:domain_verify": "cf7fa70add16b883a1f4de8faee8b43a",
    },
  },

  // ✅ Canonical
  alternates: {
    canonical: "https://shopdeeglobalgh.com",
  },

  // ✅ Open Graph
  openGraph: {
    title: "DeeglobalGh | Textbooks, School Essentials & Delivery",
    description:
      "Shop textbooks, stationery, and school essentials in Ghana. Fast delivery across Kasoa and beyond.",
    url: "https://shopdeeglobalgh.com",
    siteName: "DeeglobalGh",
    locale: "en_GH",
    type: "website",
  },

  // ✅ Twitter
  twitter: {
    card: "summary",
    title: "DeeglobalGh | Textbooks & School Essentials",
    description:
      "Order textbooks and school supplies in Ghana with fast delivery.",
  },

  // ✅ Robots
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header /> {/* ✅ RESTORED HEADER */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}