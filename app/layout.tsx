import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./context/CartContext";

export const metadata: Metadata = {
  title: "DeeglobalGh | Textbooks, School Essentials & Delivery",
  description:
    "Shop textbooks, stationery, and school essentials in Ghana. Fast delivery across Kasoa and beyond.",

  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">

        <CartProvider>

          {/* HEADER */}
          <Header />

          {/* PAGE CONTENT WRAPPER */}
          <main className="min-h-screen">
            {children}
          </main>

        </CartProvider>

      </body>
    </html>
  );
}