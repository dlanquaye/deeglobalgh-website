"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/app/lib/products";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  slug: string;
  imageSrc?: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "dg_cart_v1";

function safeParse(json: string | null) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ✅ Load from localStorage (once)
  useEffect(() => {
    const raw = safeParse(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
    if (Array.isArray(raw)) setItems(raw);
  }, []);

  // ✅ Save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === product.id);
      if (existing) {
        return prev.map((x) => (x.id === product.id ? { ...x, qty: x.qty + qty } : x));
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          slug: product.slug,
          imageSrc: product.image?.src,
          qty,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const increaseQty = (id: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  };

  const decreaseQty = (id: string) => {
    setItems((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, x) => sum + x.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, x) => sum + x.price * x.qty, 0), [items]);

  const value: CartContextValue = {
    items,
    totalItems,
    subtotal,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
