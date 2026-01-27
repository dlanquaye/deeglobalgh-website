"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  addToCart: (product: Product, qty?: number) => boolean;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => boolean;
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

  /* -------------------------------------------
     LOAD FROM LOCAL STORAGE
     ------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = safeParse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(raw)) {
      setItems(raw);
    }
  }, []);

  /* -------------------------------------------
     SAVE TO LOCAL STORAGE
     ------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* -------------------------------------------
     ADD TO CART (STOCK ENFORCED)
     ------------------------------------------- */
  const addToCart = (product: Product, qty: number = 1): boolean => {
    const stockQty = product.stockQty ?? 0;

    if (stockQty <= 0) {
      return false;
    }

    let added = false;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const existingQty = existing?.qty ?? 0;

      if (existingQty + qty > stockQty) {
        return prev;
      }

      added = true;

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item
        );
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

    return added;
  };

  /* -------------------------------------------
     INCREASE / DECREASE
     ------------------------------------------- */
  const increaseQty = (id: string): boolean => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
    return true;
  };

  const decreaseQty = (id: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  /* -------------------------------------------
     DERIVED VALUES
     ------------------------------------------- */
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      ),
    [items]
  );

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

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
