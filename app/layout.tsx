import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/app/context/CartContext";
import CartCount from "@/app/components/CartCount";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeeGlobalGH | Textbooks, School Essentials & Delivery",
  description:
    "Shop textbooks, school essentials, exam materials and dormitory items in Ghana. Order online for delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  // ✅ Organization schema (site-wide SEO authority)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DeeglobalGh",
    url: "https://deeglobalgh.com",
    telephone: "+233246011773",
    sameAs: ["https://wa.me/233246011773"],
    areaServed: ["Kasoa", "Ghana"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kasoa",
      addressCountry: "GH",
    },
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✅ Organization Schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* ✅ Cart Provider (site-wide) */}
        <CartProvider>
          {/* Site Header (Shows on every page) */}
          <header className="sticky top-0 z-50 border-b bg-white">
            {/* Small top accent line (Blue + Gold) */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-900 via-blue-700 to-yellow-500" />

            <div className="mx-auto max-w-6xl px-4">
              <div className="flex items-center justify-between gap-3 py-3">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2 min-w-0">
                  <div className="text-lg font-extrabold tracking-tight text-blue-900 whitespace-nowrap">
                    DeeGlobalGH
                  </div>

                  <span className="hidden rounded-full bg-yellow-500 px-2 py-1 text-[11px] font-bold text-blue-950 sm:inline-block">
                    Delivery Available
                  </span>
                </Link>

                {/* Navigation (Mobile optimized) */}
                <nav className="flex items-center gap-2 text-sm font-semibold shrink-0">
                  {/* Desktop links (hidden on mobile) */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                      href="/"
                      className="rounded-lg px-3 py-2 text-blue-900 hover:bg-blue-50"
                    >
                      Home
                    </Link>

                    <Link
                      href="/shop"
                      className="rounded-lg px-3 py-2 text-blue-900 hover:bg-blue-50"
                    >
                      Shop
                    </Link>

                    <Link
                      href="/category/textbooks"
                      className="rounded-lg px-3 py-2 text-blue-900 hover:bg-blue-50"
                    >
                      Textbooks
                    </Link>
                  </div>

                  {/* WhatsApp (always visible) */}
                  <a
                    href="https://wa.me/233246011773"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-yellow-500 px-3 py-2 font-extrabold text-blue-950 hover:opacity-90"
                  >
                    WhatsApp
                  </a>

                  {/* Cart (always visible) */}
                  <Link
  href="/cart"
  className="rounded-lg border border-blue-200 px-3 py-2 font-bold text-blue-900 hover:bg-blue-50"
>
  Cart<CartCount />
</Link>

                </nav>
              </div>

              {/* Small helper line */}
              <div className="pb-3 text-xs text-gray-600 break-words whitespace-normal">
                Fast delivery • Textbooks • Exam essentials • School supplies
              </div>
            </div>
          </header>

          {/* Page content */}
<div className="min-h-screen bg-[color:var(--bg-page)]">
  <div className="mx-auto max-w-6xl px-4 py-6">
    {children}
  </div>
</div>


          {/* Footer */}
          <footer className="mt-16 border-t bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-10">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="text-base font-extrabold text-blue-900">
                    DeeGlobalGH
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    Smart Deals, Everyday Needs.
                  </p>
                </div>

                <div>
                  <div className="text-sm font-bold text-blue-900">Delivery</div>
                  <p className="mt-2 text-sm text-gray-700">
                    Order online and we deliver across Kasoa, Accra, and beyond.
                  </p>
                </div>

                <div>
                  <div className="text-sm font-bold text-blue-900">Contact</div>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <div>
                      WhatsApp:{" "}
                      <span className="font-semibold">0246 011 773</span>
                    </div>
                    <div>
                      Call: <span className="font-semibold">054 113 1111</span>
                    </div>
                    <div>
                      Call: <span className="font-semibold">030 398 2358</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-blue-900">Quick Links</div>
                  <div className="mt-2 flex flex-col gap-2 text-sm">
                    <Link href="/shop" className="text-blue-900 hover:underline">
                      Shop All Products
                    </Link>

                    <Link
                      href="/category/textbooks"
                      className="text-blue-900 hover:underline"
                    >
                      Textbooks
                    </Link>

                    <a
                      href="https://wa.me/233246011773"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-900 hover:underline"
                    >
                      WhatsApp Support
                    </a>

                    <Link
                      href="/admin/products"
                      className="text-blue-900 hover:underline"
                    >
                      Admin • Products
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center text-xs text-gray-500">
                © {year} DeeGlobalGH. All rights reserved.
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
