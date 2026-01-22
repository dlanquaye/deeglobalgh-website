import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/app/context/CartContext";
import { CartDrawerProvider } from "@/app/context/CartDrawerProvider";
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
    url: "https://shopdeeglobalgh.com",
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

        {/* ✅ Providers */}
        <CartProvider>
          <CartDrawerProvider>
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

                  {/* Navigation */}
                  <nav className="flex items-center gap-2 text-sm font-semibold shrink-0">
                    {/* Desktop links */}
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

                    {/* Cart */}
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
              <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
            </div>

            {/* Floating WhatsApp Chat Button (site-wide) */}
            <a
              href="https://wa.me/233246011773"
              target="_blank"
              rel="noreferrer"
              aria-label="Chat on WhatsApp"
              title="Chat on WhatsApp"
              className="group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-green-600 shadow-xl transition hover:opacity-95 hover:scale-105"
            >
              {/* Tooltip */}
              <span className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-lg sm:block opacity-0 group-hover:opacity-100 transition">
                Need help? Chat on WhatsApp
              </span>

              {/* WhatsApp SVG Icon */}
              <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
                <path d="M19.11 17.56c-.27-.13-1.58-.78-1.82-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.16-1.33-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.44.09-.18.04-.33-.02-.47-.07-.13-.6-1.44-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.71.33-.24.27-.93.91-.93 2.22 0 1.31.96 2.58 1.09 2.76.13.18 1.89 2.89 4.58 4.05.64.28 1.14.45 1.53.58.64.2 1.23.17 1.69.1.52-.08 1.58-.64 1.8-1.26.22-.62.22-1.16.16-1.26-.07-.11-.24-.18-.51-.31z" />
                <path d="M16.04 3C9.4 3 4 8.3 4 14.83c0 2.31.7 4.45 1.9 6.24L4 29l8.14-1.86c1.72.94 3.7 1.48 5.9 1.48 6.64 0 12.04-5.3 12.04-11.83C30.08 8.3 22.68 3 16.04 3zm0 23.4c-2.03 0-3.9-.56-5.5-1.53l-.4-.24-4.83 1.1 1.12-4.64-.26-.42c-1.15-1.65-1.77-3.56-1.77-5.54 0-5.57 4.67-10.1 10.64-10.1 5.98 0 10.64 4.53 10.64 10.1 0 5.57-4.66 10.1-10.64 10.1z" />
              </svg>
            </a>

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
                        WhatsApp: <span className="font-semibold">0246 011 773</span>
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
          </CartDrawerProvider>
        </CartProvider>
      </body>
    </html>
  );
}
