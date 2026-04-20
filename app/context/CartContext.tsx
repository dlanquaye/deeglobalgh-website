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

/**
 * Minimal product shape required by cart.
 * Decoupled from Prisma and static product types.
 */
export type CartProductInput = {
  id: string;
  name: string;
  slug: string;
  retailPrice: number;
  imageSrc?: string | null;
  stockQty: number;
};

export type CartItem = {
  id: string;
  name: string;
  retailPrice: number;
  slug: string;
  imageSrc?: string | null;
  qty: number;
  stockQty: number;
};

type CartContextValue = {
  cartItems: any[];
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (product: CartProductInput, qty?: number) => boolean;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => boolean;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "dg_cart_v2";

/* -------------------------------------------
   HELPERS
------------------------------------------- */
function safeParse(json: string | null) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------
   PROVIDER
------------------------------------------- */
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
     ADD TO CART (STRICT STOCK ENFORCEMENT)
  ------------------------------------------- */
  const addToCart = (
  product: CartProductInput,
  qty: number = 1
): boolean => {
  let allowed = true;

  setItems((prev) => {
    const existing = prev.find((item) => item.id === product.id);

    // If item already exists → increase qty
    if (existing) {
      const newQty = existing.qty + qty;

      return prev.map((item) =>
        item.id === product.id
          ? { ...item, qty: newQty }
          : item
      );
    }

    // New item
    return [
      ...prev,
      {
        id: product.id,
        name: product.name,
        retailPrice: product.retailPrice,
        slug: product.slug,
        imageSrc: product.imageSrc ?? null,
        qty: qty,
        stockQty: 999, // temporary
      },
    ];
  });

  return allowed;
};

  /* -------------------------------------------
     INCREASE / DECREASE (STOCK SAFE)
  ------------------------------------------- */
  const increaseQty = (id: string): boolean => {
    let allowed = true;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (item.qty + 1 > item.stockQty) {
          allowed = false;
          return item;
        }

        return { ...item, qty: item.qty + 1 };
      })
    );

    return allowed;
  };

  const decreaseQty = (id: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
  setItems([]);

  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};

  /* -------------------------------------------
     DERIVED VALUES
  ------------------------------------------- */
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const subtotal = useMemo(
  () =>
    items.reduce((sum, item) => {
      const price = Number(item.retailPrice) || 0;
      const qty = Number(item.qty) || 0;
      return sum + price * qty;
    }, 0),
  [items]
);

  const value: CartContextValue = {
  cartItems: items, // ✅ ADD THIS LINE
  items,            // keep this if used elsewhere
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
   HOOK
------------------------------------------- */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}