"use client";

import {
  FormEvent,
  useRef,
  useState,
} from "react";

type Product = {
  id: string;
  sku: string | null;
  name: string;
};

export default function ReceiveStockPage() {
  const [productId, setProductId] =
    useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [quantity, setQuantity] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<Product[]>([]);

  const [scanValue, setScanValue] =
    useState("");

  const [scanMessage, setScanMessage] =
    useState("");

  const [scanSuccess, setScanSuccess] =
    useState(false);

  const [isScanning, setIsScanning] =
    useState(false);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const scanInputRef =
    useRef<HTMLInputElement | null>(null);

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
  // MANUAL PRODUCT SELECTION
  // ==========================================
  const selectProduct = (
    product: Product
  ) => {
    setProductId(product.id);
    setSelectedProduct(product);

    setQuery(
      product.sku
        ? `${product.name} (${product.sku})`
        : product.name
    );

    setResults([]);

    if (!quantity) {
      setQuantity("1");
    }

    setScanMessage("");
  };

  // ==========================================
  // SKU SCANNER
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

        return;
      }

      // No product selected yet:
      // first scan selects it and starts at 1.
      if (!selectedProduct) {
        setProductId(
          exactProduct.id
        );

        setSelectedProduct(
          exactProduct
        );

        setQuantity("1");

        setQuery("");
        setResults([]);

        setScanMessage(
          `${exactProduct.name} selected — quantity 1`
        );

        setScanSuccess(true);
        setScanValue("");

        return;
      }

      // Same product:
      // every additional scan increments quantity.
      if (
        selectedProduct.id ===
        exactProduct.id
      ) {
        const currentQuantity =
          Number(quantity) || 0;

        const nextQuantity =
          currentQuantity + 1;

        setQuantity(
          String(nextQuantity)
        );

        setScanMessage(
          `${exactProduct.name} — quantity ${nextQuantity}`
        );

        setScanSuccess(true);
        setScanValue("");

        return;
      }

      // Different product scanned while one
      // is already waiting to be received.
      setScanMessage(
        `Receive ${selectedProduct.name} first before scanning ${exactProduct.name}.`
      );

      setScanSuccess(false);
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
  // RECEIVE STOCK
  // ==========================================
  const handleReceiveStock =
    async () => {
      if (isProcessing) {
        return;
      }

      if (!productId) {
        alert(
          "Please select or scan a product"
        );

        return;
      }

      const parsedQuantity =
        Number(quantity);

      if (
        !Number.isInteger(
          parsedQuantity
        ) ||
        parsedQuantity <= 0
      ) {
        alert(
          "Please enter a valid whole-number quantity"
        );

        return;
      }

      setIsProcessing(true);

      try {
        const res = await fetch(
          "/api/inventory/receive",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              productId,
              quantity:
                parsedQuantity,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          alert(
            data.error ||
              "Receive stock failed"
          );

          return;
        }

        alert(
          "Stock received successfully"
        );

        setProductId("");
        setSelectedProduct(null);
        setQuery("");
        setQuantity("");
        setResults([]);
        setScanValue("");
        setScanMessage("");
        setScanSuccess(false);

        requestAnimationFrame(() => {
          scanInputRef.current?.focus();
        });
      } catch {
        alert(
          "Something went wrong"
        );
      } finally {
        setIsProcessing(false);
      }
    };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Receive Stock
      </h1>

      <div className="max-w-2xl space-y-6">
        {/* SCANNER */}
        <div className="border p-4 rounded-xl bg-green-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                Scan Product
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Scan the same SKU repeatedly
                to build the received
                quantity.
              </p>
            </div>

            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
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
                className="bg-green-700 text-white px-5 py-3 rounded-lg disabled:opacity-50"
              >
                {isScanning
                  ? "Scanning..."
                  : "Add"}
              </button>
            </div>
          </form>

          {scanMessage && (
            <p
              className={
                scanSuccess
                  ? "mt-3 text-sm font-medium text-green-700"
                  : "mt-3 text-sm font-medium text-red-700"
              }
            >
              {scanMessage}
            </p>
          )}
        </div>

        {/* MANUAL FALLBACK */}
        <div className="border p-4 rounded-xl">
          <h2 className="font-semibold mb-4">
            Search Product
          </h2>

          <input
            type="text"
            value={query}
            onChange={(e) =>
              handleSearch(
                e.target.value
              )
            }
            placeholder="Search product by name or SKU..."
            className="w-full border p-2 rounded-lg"
          />

          {results.length > 0 && (
            <div className="mt-3 space-y-2">
              {results.map(
                (product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() =>
                      selectProduct(
                        product
                      )
                    }
                    className="w-full border p-3 rounded-lg text-left hover:bg-gray-50"
                  >
                    <div className="font-medium">
                      {product.name}
                    </div>

                    {product.sku && (
                      <div className="text-xs text-gray-500 mt-1">
                        {product.sku}
                      </div>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* SELECTED PRODUCT */}
        {selectedProduct && (
          <div className="border p-4 rounded-xl">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Selected Product
            </p>

            <p className="mt-1 font-semibold">
              {selectedProduct.name}
            </p>

            {selectedProduct.sku && (
              <p className="text-sm text-gray-500">
                SKU:{" "}
                {selectedProduct.sku}
              </p>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Quantity Received
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={
                handleReceiveStock
              }
              disabled={
                isProcessing
              }
              className="mt-4 w-full bg-black text-white p-3 rounded-lg disabled:opacity-50"
            >
              {isProcessing
                ? "Processing..."
                : `Receive ${
                    quantity || "0"
                  } Unit${
                    Number(quantity) ===
                    1
                      ? ""
                      : "s"
                  }`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}