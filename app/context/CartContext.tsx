"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* -------------------------------------------
   TYPES
------------------------------------------- */
type CartItem = {
  id: string;
  name: string;
  retailPrice: number;
  slug: string;
  imageSrc?: string;
  stockQty: number;
  quantity: number;
};

type ProductInput = {
  id: string;
  name: string;
  retailPrice: number;
  slug: string;
  imageSrc?: string;
  stockQty: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (product: ProductInput, qty?: number) => boolean;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => boolean;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "dg_cart_v1";

/* -------------------------------------------
   Helpers
------------------------------------------- */
function safeParse(json: string | null) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------
   Provider
------------------------------------------- */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* Load from localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = safeParse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(raw)) {
      setItems(raw);
    }
  }, []);

  /* Save to localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* -------------------------------------------
     Add To Cart (Stock Protected)
  ------------------------------------------- */
  const addToCart = (product: ProductInput, qty: number = 1): boolean => {
    const stockQty = product.stockQty ?? 0;
    if (stockQty <= 0) return false;

    let allowed = true;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + qty > stockQty) {
        allowed = false;
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }

      return [...prev, { ...product, quantity: qty }];
    });

    return allowed;
  };

  /* -------------------------------------------
     Increase Quantity (Stock Protected)
  ------------------------------------------- */
  const increaseQty = (id: string): boolean => {
    let allowed = true;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (item.quantity + 1 > item.stockQty) {
          allowed = false;
          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      })
    );

    return allowed;
  };

  /* -------------------------------------------
     Decrease Quantity
  ------------------------------------------- */
  const decreaseQty = (id: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* -------------------------------------------
     Remove Item
  ------------------------------------------- */
  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* -------------------------------------------
     Clear Cart
  ------------------------------------------- */
  const clearCart = () => setItems([]);

  /* -------------------------------------------
     Derived Values
  ------------------------------------------- */
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.retailPrice * item.quantity,
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

/* -------------------------------------------
   Hook
------------------------------------------- */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
