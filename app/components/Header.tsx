"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/app/context/CartContext";
import { trackDirectionsClick } from "@/app/lib/analytics";

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/SBPXu3sPzMGngRaq8";

export default function Header() {
  const pathname =
    usePathname();

  const { totalItems } =
    useCart();

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith(
      "/admin/"
    );

  if (isAdminRoute) {
    return null;
  }

  return (
    <header className="border-b bg-white">

      {/* TOP ROW */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        {/* LEFT (MAKE LOGO CLICKABLE) */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <img
            src="/products/deeglobalgh-logo.png"
            alt="DeeGlobalGH"
            className="w-10 h-10 object-contain"
          />

          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
            Delivery Available
          </span>
        </Link>

        {/* RIGHT NAV */}
        <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium flex-wrap">
          <Link href="/">
            Home
          </Link>

          <Link href="/shop">
            Shop
          </Link>

          <Link href="/category/textbooks">
            Textbooks
          </Link>

          <a
            href={GOOGLE_MAPS_URL}
            onClick={() => trackDirectionsClick("header", GOOGLE_MAPS_URL)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-700 hover:underline"
            aria-label="Get directions to DeeGlobalGH on Google Maps"
          >
            <span aria-hidden="true">📍</span>
            Directions
          </a>

          <Link
            href="/cart"
            className="border px-3 py-1 rounded-md"
          >
            Cart ({totalItems})
          </Link>
        </nav>
      </div>

      {/* BOTTOM STRIP */}
      <div className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-2 text-sm text-gray-600">
          Fast delivery • Textbooks • Exam essentials • School supplies
        </div>
      </div>

    </header>
  );
}