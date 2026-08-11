"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";

type Product = {
  id: string;
  sku: string | null;
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

  const [scanValue, setScanValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false);

  const scanInputRef =
    useRef<HTMLInputElement | null>(null);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [isProcessing, setIsProcessing] =
    useState(false);

  // ==========================================
  // NORMAL PRODUCT SEARCH
  // ==========================================
  const handleSearch = async (
    value: string
  ) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `/api/pos/search?q=${encodeURIComponent(
          value
        )}`
      );

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        setResults([]);
        return;
      }

      setResults(data);
    } catch {
      setResults([]);
    }
  };

  // ==========================================
  // ADD PRODUCT TO CART
  // ==========================================
  const addToCart = (
    product: Product
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          retailPrice:
            product.retailPrice,
          quantity: 1,
        },
      ];
    });
  };

  // ==========================================
  // SCANNER / EXACT SKU LOOKUP
  // ==========================================
  const handleScan = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const scannedSku =
      scanValue.trim();

    if (
      !scannedSku ||
      isScanning
    ) {
      return;
    }

    setIsScanning(true);
    setScanMessage("");
    setScanSuccess(false);

    try {
      const res = await fetch(
        `/api/pos/search?q=${encodeURIComponent(
          scannedSku
        )}`
      );

      const data = await res.json();

      if (
        !res.ok ||
        !Array.isArray(data)
      ) {
        throw new Error(
          "Unable to identify scanned product"
        );
      }

      const exactProduct =
        data.find(
          (product: Product) =>
            product.sku
              ?.trim()
              .toLowerCase() ===
            scannedSku.toLowerCase()
        );

      if (!exactProduct) {
        setScanMessage(
          `No active product found for SKU: ${scannedSku}`
        );

        setScanSuccess(false);

        return;
      }

      addToCart(exactProduct);

      setScanMessage(
        `${exactProduct.name} added to cart`
      );

      setScanSuccess(true);
      setScanValue("");
    } catch (error) {
      setScanMessage(
        error instanceof Error
          ? error.message
          : "Unable to scan product"
      );

      setScanSuccess(false);
    } finally {
      setIsScanning(false);

      requestAnimationFrame(() => {
        scanInputRef.current?.focus();
      });
    }
  };

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================
  const removeFromCart = (
    productId: string
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.id !== productId
      )
    );
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================
  const updateQuantity = (
    productId: string,
    type: "inc" | "dec"
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.id !== productId
          ) {
            return item;
          }

          if (type === "inc") {
            return {
              ...item,
              quantity:
                item.quantity + 1,
            };
          }

          if (type === "dec") {
            const newQty =
              item.quantity - 1;

            return newQty > 0
              ? {
                  ...item,
                  quantity:
                    newQty,
                }
              : null;
          }

          return item;
        })
        .filter(
          Boolean
        ) as CartItem[]
    );
  };

  // ==========================================
  // CLEAR CART
  // ==========================================
  const clearCart = () => {
    setCart([]);
  };

  // ==========================================
  // CHECKOUT
  // ==========================================
  const handleCheckout =
    async () => {
      if (isProcessing) {
        return;
      }

      if (cart.length === 0) {
        alert("Cart is empty");
        return;
      }

      setIsProcessing(true);

      try {
        const res = await fetch(
          "/api/pos/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              customerName,
              customerPhone,
              paymentMethod,

              items: cart.map(
                (item) => ({
                  id: item.id,
                  quantity:
                    item.quantity,
                })
              ),
            }),
          }
        );

        const data =
          await res.json();

        console.log(
          "CHECKOUT RESPONSE:",
          data
        );

        if (!res.ok) {
          alert(
            data.error ||
              "Checkout failed"
          );

          return;
        }

        window.location.href =
          `/admin/orders/${data.orderId}/receipt?source=pos`;

        setCart([]);
      } catch {
        alert(
          "Something went wrong"
        );
      } finally {
        setIsProcessing(false);
      }
    };

  const total = cart.reduce(
    (sum, item) =>
      sum +
      item.retailPrice *
        item.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        POS System
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">
          {/* SCANNER */}
          <div className="border p-4 rounded-xl bg-blue-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">
                  Scan Product
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Scan a DeeglobalGH SKU
                  barcode. The product will
                  be added directly to the
                  cart.
                </p>
              </div>

              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Scanner Ready
              </span>
            </div>

            <form
              onSubmit={handleScan}
              className="mt-4"
            >
              <div className="flex gap-2">
                <input
                  ref={scanInputRef}
                  type="text"
                  value={scanValue}
                  onChange={(e) =>
                    setScanValue(
                      e.target.value
                    )
                  }
                  placeholder="Scan SKU barcode here..."
                  autoComplete="off"
                  autoFocus
                  className="flex-1 border p-3 rounded-lg bg-white"
                />

                <button
                  type="submit"
                  disabled={
                    isScanning ||
                    !scanValue.trim()
                  }
                  className="bg-blue-700 text-white px-5 py-3 rounded-lg disabled:opacity-50"
                >
                  {isScanning
                    ? "Scanning..."
                    : "Add"}
                </button>
              </div>
            </form>

            {scanMessage && (
              <div
                className={
                  scanSuccess
                    ? "mt-3 text-sm font-medium text-green-700"
                    : "mt-3 text-sm font-medium text-red-700"
                }
              >
                {scanMessage}
              </div>
            )}
          </div>

          {/* NORMAL SEARCH */}
          <div className="border p-4 rounded-xl">
            <h2 className="font-semibold mb-4">
              Search Products
            </h2>

            <input
              type="text"
              value={query}
              onChange={(e) =>
                handleSearch(
                  e.target.value
                )
              }
              placeholder="Search by product name or SKU..."
              className="w-full border p-2 rounded-lg"
            />

            <div className="mt-4 space-y-2">
              {results.length ===
              0 ? (
                <p className="text-sm text-gray-500">
                  No products found
                </p>
              ) : (
                results.map(
                  (product) => (
                    <div
                      key={
                        product.id
                      }
                      onClick={() =>
                        addToCart(
                          product
                        )
                      }
                      className="border p-2 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    >
                      <div>
                        <div>
                          {
                            product.name
                          }
                        </div>

                        {product.sku && (
                          <div className="text-xs text-gray-500">
                            {
                              product.sku
                            }
                          </div>
                        )}
                      </div>

                      <span className="font-semibold">
                        GHS{" "}
                        {
                          product.retailPrice
                        }
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: CART */}
        <div className="border p-4 rounded-xl">
          <h2 className="font-semibold mb-4">
            Cart
          </h2>

          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">
              Cart is empty
            </p>
          ) : (
            <div>
              {cart.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm mb-2"
                  >
                    <span>
                      {item.name}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            "dec"
                          )
                        }
                        className="px-2 bg-gray-200 rounded"
                      >
                        -
                      </button>

                      <span>
                        {
                          item.quantity
                        }
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            "inc"
                          )
                        }
                        className="px-2 bg-gray-200 rounded"
                      >
                        +
                      </button>

                      <span className="ml-2">
                        GHS{" "}
                        {item.retailPrice *
                          item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          removeFromCart(
                            item.id
                          )
                        }
                        className="text-red-500 text-xs ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* TOTAL + ACTIONS */}
          <div className="mt-4 space-y-3">
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>

              <span>
                GHS{" "}
                {total.toFixed(2)}
              </span>
            </div>

            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) =>
                setCustomerName(
                  e.target.value
                )
              }
              className="w-full border p-2 rounded-lg"
            />

            <input
              type="text"
              placeholder="Customer Phone"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(
                  e.target.value
                )
              }
              className="w-full border p-2 rounded-lg"
            />

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
              className="w-full border p-2 rounded-lg"
            >
              <option value="CASH">
                Cash
              </option>

              <option value="MOMO">
                Mobile Money
              </option>

              <option value="BANK_TRANSFER">
                Bank Transfer
              </option>
            </select>

            <button
              onClick={clearCart}
              className="w-full bg-gray-200 text-black p-2 rounded-lg"
            >
              Clear Cart
            </button>

            <button
              onClick={
                handleCheckout
              }
              disabled={
                isProcessing
              }
              className="w-full bg-black text-white p-2 rounded-lg disabled:opacity-50"
            >
              {isProcessing
                ? "Processing..."
                : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}