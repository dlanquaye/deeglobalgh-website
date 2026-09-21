import type { Metadata } from "next";
import Script from "next/script";
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
          <Header />

          {children}
        </CartProvider>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2S4Q5JV5SP"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            gtag('js', new Date());
            gtag('config', 'G-2S4Q5JV5SP');
          `}
        </Script>
      </body>
    </html>
  );
}