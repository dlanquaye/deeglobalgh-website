"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
};

export default function InventoryAdjustmentPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [locationType, setLocationType] = useState("WAREHOUSE");
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

      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    }
  };

  const handleAdjustment = async () => {
  if (!productId) {
    alert("Please select a product");
    return;
  }

  if (!quantity || Number(quantity) === 0) {
    alert("Please enter a valid quantity");
    return;
  }

  if (!locationType) {
  alert("Please select a location");
  return;
}


  if (!reason.trim()) {
    alert("Please enter a reason");
    return;
  }

  const payload = {
  productId,
  quantity: Number(quantity),
  locationType,
  reason,
};

const res = await fetch(
  "/api/inventory/adjustment",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);

const data = await res.json();

console.log(data);

alert(data.message);
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Inventory Adjustment
      </h1>

      <div className="max-w-xl border rounded-xl p-4">
        <input
          type="text"
          value={query}
          onChange={(e) =>
            handleSearch(e.target.value)
          }
          placeholder="Search product..."
          className="w-full border p-2 rounded-lg"
        />

        <div className="mt-4 space-y-2">
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

{productId && (
  <div className="mt-4 border rounded-lg p-2 bg-gray-50">
    Selected Product ID: {productId}
    <input
  type="number"
  placeholder="Adjustment Quantity"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
  className="w-full border p-2 rounded-lg mt-4"
/>

<input
  type="text"
  placeholder="Reason for adjustment"
  value={reason}
  onChange={(e) => setReason(e.target.value)}
  className="w-full border p-2 rounded-lg mt-4"
/>

<select
  value={locationType}
  onChange={(e) => setLocationType(e.target.value)}
  className="w-full border p-2 rounded-lg mt-4"
>
  <option value="WAREHOUSE">
    Warehouse
  </option>

  <option value="BRANCH">
    Branch
  </option>
</select>

<button
  onClick={handleAdjustment}
  className="w-full bg-red-600 text-white p-2 rounded-lg mt-4"
>
  Create Adjustment
</button>

  </div>

  
)}




        </div>
      </div>
    </div>
  );
}