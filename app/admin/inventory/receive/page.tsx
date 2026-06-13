"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
};

export default function ReceiveStockPage() {
  const [productId, setProductId] = useState("");
const [quantity, setQuantity] = useState("");

const [query, setQuery] = useState("");
const [results, setResults] = useState<Product[]>([]);

const [isProcessing, setIsProcessing] = useState(false);

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

const handleReceiveStock = async () => {
  if (isProcessing) return;

  if (!productId) {
    alert("Please select a product");
    return;
  }

  if (!quantity || Number(quantity) <= 0) {
    alert("Please enter a valid quantity");
    return;
  }

  setIsProcessing(true);

  try {
    const res = await fetch("/api/inventory/receive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        quantity: Number(quantity),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Receive stock failed");
      return;
    }

    alert("Stock received successfully");

    setProductId("");
    setQuery("");
    setQuantity("");
    setResults([]);
  } catch {
    alert("Something went wrong");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Receive Stock
      </h1>

      <div className="border p-4 rounded-xl max-w-xl">
        <div className="space-y-4">

          <input
  type="text"
  value={query}
  onChange={(e) => handleSearch(e.target.value)}
  placeholder="Search product..."
  className="w-full border p-2 rounded-lg"
/>

<div className="space-y-2">
  {results.map((product) => (
    <div
      key={product.id}
      onClick={() => {
        setProductId(product.id);
        setQuery(product.name);
        setResults([]);
      }}
      className="border p-2 rounded-lg cursor-pointer hover:bg-gray-100"
    >
      {product.name}
    </div>
  ))}
</div>

{productId && (
  <div className="border rounded-lg p-2 bg-gray-50">
    Selected Product ID: {productId}
  </div>
)}

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border p-2 rounded-lg"
          />

          <button
  onClick={handleReceiveStock}
  disabled={isProcessing}
  className="w-full bg-black text-white p-2 rounded-lg disabled:opacity-50"
>
  {isProcessing ? "Processing..." : "Receive Stock"}
</button>

        </div>
      </div>
    </div>
  );
}