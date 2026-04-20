import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
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
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

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
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2S4Q5JV5SP"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2S4Q5JV5SP', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* ✅ SINGLE CART PROVIDER (FIXED) */}
        <CartProvider>
          {/* HEADER */}
          <header className="sticky top-0 z-50 border-b bg-white">
            <div className="h-1 w-full bg-gradient-to-r from-blue-900 via-blue-700 to-yellow-500" />

            <div className="mx-auto max-w-6xl px-4">
              <div className="flex items-center justify-between gap-3 py-3">
                <Link href="/" className="flex items-center gap-2 min-w-0">
                  <div className="text-lg font-extrabold text-blue-900">
                    DeeGlobalGH
                  </div>

                  <span className="hidden rounded-full bg-yellow-500 px-2 py-1 text-[11px] font-bold text-blue-950 sm:inline-block">
                    Delivery Available
                  </span>
                </Link>

                <nav className="flex items-center gap-2 text-sm font-semibold">
                  <Link href="/" className="px-3 py-2 hover:bg-blue-50">
                    Home
                  </Link>

                  <Link href="/shop" className="px-3 py-2 hover:bg-blue-50">
                    Shop
                  </Link>

                  <Link
                    href="/category/textbooks"
                    className="px-3 py-2 hover:bg-blue-50"
                  >
                    Textbooks
                  </Link>

                  <Link
                    href="/cart"
                    className="border px-3 py-2 font-bold"
                  >
                    Cart <CartCount />
                  </Link>
                </nav>
              </div>

              <div className="pb-3 text-xs text-gray-600">
                Fast delivery • Textbooks • Exam essentials • School supplies
              </div>
            </div>
          </header>

          {/* MAIN */}
          <main className="min-h-screen bg-[color:var(--bg-page)]">
            <div className="mx-auto max-w-6xl px-4 py-6">
              {children}
            </div>
          </main>

          {/* WHATSAPP BUTTON */}
          <a
            href="https://wa.me/233246011773"
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-green-600 shadow-xl"
          >
            <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
              <path d="M19.11 17.56c-.27-.13-1.58-.78-1.82-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.16-1.33-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.44.09-.18.04-.33-.02-.47-.07-.13-.6-1.44-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.71.33-.24.27-.93.91-.93 2.22 0 1.31.96 2.58 1.09 2.76.13.18 1.89 2.89 4.58 4.05z" />
              <path d="M16.04 3C9.4 3 4 8.3 4 14.83c0 2.31.7 4.45 1.9 6.24L4 29l8.14-1.86c1.72.94 3.7 1.48 5.9 1.48 6.64 0 12.04-5.3 12.04-11.83C30.08 8.3 22.68 3 16.04 3z" />
            </svg>
          </a>

          {/* FOOTER */}
          <footer className="mt-16 border-t bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-gray-500">
              © {year} DeeGlobalGH. All rights reserved.
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}