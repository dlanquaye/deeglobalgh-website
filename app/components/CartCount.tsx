"use client";

import { useCart } from "@/app/context/CartContext";

export default function CartCount() {
  const { totalItems } = useCart();
  if (!totalItems) return null;

  return (
    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-yellow-500 px-2 py-0.5 text-[11px] font-extrabold text-blue-950">
      {totalItems}
    </span>
  );
}
