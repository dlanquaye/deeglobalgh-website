import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./context/CartContext";

const SITE_URL = "https://www.shopdeeglobalgh.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DeeGlobalGH | Textbooks, School Essentials & Delivery",
  description:
    "Shop textbooks, stationery, and school essentials in Ghana. Fast delivery across Kasoa and beyond.",
  manifest: "/manifest.json",
};

const businessStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Store",
      "@id": `${SITE_URL}/#store`,
      name: "DeeGlobalGH",
      url: SITE_URL,
      telephone: "+233270030000",
      email: "info@shopdeeglobalgh.com",
      description:
        "School supply shop in Kasoa offering textbooks, stationery, boarding school essentials, school reopening supplies and practical student essentials.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Kasoa New Market Road",
        addressLocality: "Kasoa",
        addressCountry: "GH",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+233270030000",
        contactType: "customer service",
        availableLanguage: "English",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DeeGlobalGH",
      url: SITE_URL,
      email: "info@shopdeeglobalgh.com",
      telephone: "+233270030000",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Script
          id="deeglobalgh-business-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessStructuredData).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

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