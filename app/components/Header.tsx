"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="border-b bg-white">

      {/* TOP ROW */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LEFT (MAKE LOGO CLICKABLE) */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/products/deeglobalgh-logo.png"
            alt="DeeglobalGh"
            className="w-10 h-10 object-contain"
          />

          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
            Delivery Available
          </span>
        </Link>

        {/* RIGHT NAV */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/category/textbooks">Textbooks</Link>

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