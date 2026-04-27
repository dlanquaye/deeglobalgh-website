"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* LEFT: LOGO + TAG */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/products/deeglobalgh-logo.png"
              alt="DeeGlobalGH Logo"
              width={45}
              height={45}
              priority
            />
          </Link>

          <span className="text-xs bg-yellow-400 px-2 py-1 rounded-full font-medium">
            Delivery Available
          </span>
        </div>

        {/* RIGHT: NAV */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/category/textbooks">Textbooks</Link>
          <Link href="/cart" className="border px-3 py-1 rounded">
           Cart ({totalItems})
          </Link>
        </nav>
      </div>

      {/* SUBTEXT */}
      <div className="max-w-6xl mx-auto px-4 pb-3 text-sm text-gray-600">
        Fast delivery • Textbooks • Exam essentials • School supplies
      </div>
    </header>
  );
}