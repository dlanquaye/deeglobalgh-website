"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  estimateId: string;
}

interface SearchProduct {
  id: string;
  sku: string;
  name: string;
  retailPrice: number;
  stockQty: number;
}

export default function AddBookForm({
  estimateId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [productName, setProductName] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [results, setResults] = useState<SearchProduct[]>([]);

  const [selectedProductId, setSelectedProductId] = useState("");

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productName.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/products/search?query=${encodeURIComponent(productName)}`
        );

        const data = await res.json();

        setResults(data);
      } catch {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [productName]);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(
        "/api/estimator/items",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  estimateId,
  productId: selectedProductId,
  productName,
  quantity,
}),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message ?? "Unable to add item.");
        setLoading(false);
        return;
      }

      setProductName("");
setSelectedProductId("");
setQuantity(1);
setResults([]);

      router.refresh();

    } catch {
      alert("Server error.");
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl border bg-white p-6"
    >
      <h2 className="mb-4 text-xl font-bold">
        Add Book
      </h2>

      <div className="relative">

        <input
          className="w-full rounded-lg border px-4 py-3"
          placeholder="Type book name..."
          value={productName}
          onFocus={() => setShowResults(true)}
          onBlur={() =>
            setTimeout(() => setShowResults(false), 200)
          }
          onChange={(e) =>
            setProductName(e.target.value)
          }
          required
        />

        {showResults && results.length > 0 && (

          <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">

            {results.map((product) => (

              <button
                key={product.id}
                type="button"
                onClick={() => {
  setProductName(product.name);
  setSelectedProductId(product.id);
  setResults([]);
}}
                className="block w-full border-b px-4 py-3 text-left hover:bg-gray-100"
              >
                <div className="font-medium">
                  {product.name}
                </div>

                <div className="text-sm text-gray-500">
                  {product.sku} • GH₵ {product.retailPrice} • Stock {product.stockQty}
                </div>

              </button>

            ))}

          </div>

        )}

      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">

        <input
          type="number"
          min={1}
          className="rounded-lg border px-4 py-3"
          value={quantity}
          onChange={(e) =>
            setQuantity(Number(e.target.value))
          }
        />

        <button
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Book"}
        </button>

      </div>

    </form>
  );
}