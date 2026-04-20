"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  retailPrice: number;
};

type CartItem = {
  id: string;
  name: string;
  retailPrice: number;
  quantity: number;
};

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  // 🔍 Search
  const handleSearch = async (value: string) => {
    setQuery(value);

    if (!value) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/pos/search?q=${value}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
  };

  // 🛒 Add to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          retailPrice: product.retailPrice,
          quantity: 1,
        },
      ];
    });
  };

  // ❌ Remove item
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ➕➖ Update quantity
  const updateQuantity = (id: string, type: "inc" | "dec") => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;

          if (type === "inc") {
            return { ...item, quantity: item.quantity + 1 };
          }

          if (type === "dec") {
            const newQty = item.quantity - 1;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }

          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // 🧹 Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // 💳 Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed");
        return;
      }

      alert("Sale completed successfully");
      setCart([]);
    } catch {
      alert("Something went wrong");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.retailPrice * item.quantity,
    0
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">POS System</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT: SEARCH */}
        <div className="md:col-span-2 border p-4 rounded-xl">
          <h2 className="font-semibold mb-4">Search Products</h2>

          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by product name..."
            className="w-full border p-2 rounded-lg"
          />

          <div className="mt-4 space-y-2">
            {results.length === 0 ? (
              <p className="text-sm text-gray-500">No products found</p>
            ) : (
              (Array.isArray(results) ? results : []).map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="border p-2 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
                >
                  <span>{product.name}</span>
                  <span className="font-semibold">
                    GHS {product.retailPrice}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: CART */}
        <div className="border p-4 rounded-xl">
          <h2 className="font-semibold mb-4">Cart</h2>

          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">Cart is empty</p>
          ) : (
            <div>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm mb-2"
                >
                  <span>{item.name}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, "dec")}
                      className="px-2 bg-gray-200 rounded"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.id, "inc")}
                      className="px-2 bg-gray-200 rounded"
                    >
                      +
                    </button>

                    <span className="ml-2">
                      GHS {item.retailPrice * item.quantity}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 text-xs ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TOTAL + ACTIONS */}
          <div className="mt-6 border-t pt-4 space-y-2">
            <p className="font-semibold">Total: GHS {total}</p>

            <button
              onClick={clearCart}
              className="w-full bg-gray-200 text-black p-2 rounded-lg"
            >
              Clear Cart
            </button>

            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white p-2 rounded-lg"
            >
              Complete Sale
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}