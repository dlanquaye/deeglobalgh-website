"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Product = {
  id: string;
  name: string;
  sku?: string;
};

type StockLocation = {
  locationType: "BRANCH" | "WAREHOUSE";
  locationId: string;
  name: string;
  location: string;
};

type LocationResponse = {
  success?: boolean;
  locations?: StockLocation[];
  message?: string;
};

type AdjustmentResponse = {
  success?: boolean;
  message?: string;
  previousQuantity?: number;
  newQuantity?: number;
};

export default function InventoryAdjustmentPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const [loadingLocations, setLoadingLocations] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      try {
        const response = await fetch(
          "/api/inventory/adjustment/locations",
          { cache: "no-store" }
        );

        const data =
          (await response.json()) as LocationResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load stock locations."
          );
        }

        if (!cancelled) {
          setLocations(data.locations || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load locations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingLocations(false);
        }
      }
    }

    void loadLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (product || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setSearching(true);

      try {
        const response = await fetch(
          `/api/pos/search?q=${encodeURIComponent(query.trim())}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Product search failed.");
        }

        const data: unknown = await response.json();

        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, product]);

  function chooseProduct(item: Product) {
    if (submittingRef.current) {
      return;
    }

    setProduct(item);
    setQuery(item.name);
    setResults([]);
    setError("");
    setSuccess("");
  }

  function clearProduct() {
    if (submittingRef.current) {
      return;
    }

    setProduct(null);
    setQuery("");
    setResults([]);
    setError("");
    setSuccess("");
  }

  async function handleAdjustment() {
    if (submittingRef.current) {
      return;
    }

    setError("");
    setSuccess("");

    if (!product) {
      setError("Please select a product.");
      return;
    }

    const location = locations.find(
      (item) =>
        `${item.locationType}:${item.locationId}` ===
        selectedLocation
    );

    if (!location) {
      setError("Please select a specific stock location.");
      return;
    }

    const adjustment = Number(quantity);

    if (
      !quantity.trim() ||
      !Number.isSafeInteger(adjustment) ||
      adjustment === 0
    ) {
      setError(
        "Adjustment must be a non-zero whole number."
      );
      return;
    }

    if (!reason.trim()) {
      setError("Please enter the reason for this adjustment.");
      return;
    }

    const direction =
      adjustment > 0 ? "ADD" : "REMOVE";

    const confirmed = window.confirm(
      `Confirm stock adjustment?\n\n` +
        `Product: ${product.name}\n` +
        `Location: ${location.name}\n` +
        `Action: ${direction} ${Math.abs(adjustment)} units\n` +
        `Reason: ${reason.trim()}\n\n` +
        `This changes the selected location's stock.`
    );

    if (!confirmed) {
      return;
    }

    submittingRef.current = true;
    setIsProcessing(true);

    try {
      const response = await fetch(
        "/api/inventory/adjustment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            locationType: location.locationType,
            locationId: location.locationId,
            quantity: adjustment,
            reason: reason.trim(),
          }),
        }
      );

      const data =
        (await response.json()) as AdjustmentResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Stock adjustment failed."
        );
      }

      setSuccess(
        `${data.message || "Adjustment completed."} ` +
          `Location: ${location.name}.`
      );

      setQuantity("");
      setReason("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete stock adjustment."
      );
    } finally {
      submittingRef.current = false;
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">
        Inventory Adjustment
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Adjust stock at one specific authorised
        DeeGlobalGH location.
      </p>

      <div className="border rounded-xl p-5 space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-300 bg-green-50 p-3 text-green-800"
          >
            {success}
          </div>
        )}

        <div>
          <label
            htmlFor="adjust-product"
            className="block font-medium mb-2"
          >
            Product
          </label>

          <input
            id="adjust-product"
            type="text"
            value={query}
            disabled={isProcessing}
            onChange={(event) => {
              setProduct(null);
              setQuery(event.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="Search by product name or SKU"
            className="w-full border rounded-lg p-3"
          />

          {searching && (
            <p className="text-sm mt-2 text-gray-500">
              Searching...
            </p>
          )}

          {results.length > 0 && (
            <div className="border rounded-lg mt-2 overflow-hidden">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => chooseProduct(item)}
                  className="block w-full text-left p-3 border-b hover:bg-gray-100 disabled:opacity-50"
                >
                  <span className="block font-medium">
                    {item.name}
                  </span>

                  {item.sku && (
                    <span className="text-xs text-gray-500">
                      SKU: {item.sku}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {product && (
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="font-medium">
                Selected: {product.name}
              </div>

              {product.sku && (
                <div className="text-sm text-gray-600">
                  SKU: {product.sku}
                </div>
              )}

              <button
                type="button"
                onClick={clearProduct}
                disabled={isProcessing}
                className="text-sm text-blue-700 underline mt-2 disabled:opacity-50"
              >
                Change product
              </button>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="adjust-location"
            className="block font-medium mb-2"
          >
            Stock location
          </label>

          <select
            id="adjust-location"
            value={selectedLocation}
            disabled={loadingLocations || isProcessing}
            onChange={(event) => {
              setSelectedLocation(event.target.value);
              setError("");
              setSuccess("");
            }}
            className="w-full border rounded-lg p-3"
          >
            <option value="">
              {loadingLocations
                ? "Loading authorised locations..."
                : "Select the exact location"}
            </option>

            {locations.map((location) => (
              <option
                key={`${location.locationType}:${location.locationId}`}
                value={`${location.locationType}:${location.locationId}`}
              >
                {location.name} — {location.location} (
                {location.locationType === "WAREHOUSE"
                  ? "Warehouse"
                  : "Branch"})
              </option>
            ))}
          </select>

          {!loadingLocations && locations.length === 0 && (
            <p className="text-sm text-amber-700 mt-2">
              No authorised stock locations are available.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="adjust-quantity"
            className="block font-medium mb-2"
          >
            Adjustment quantity
          </label>

          <input
            id="adjust-quantity"
            type="number"
            step="1"
            value={quantity}
            disabled={isProcessing}
            onChange={(event) => {
              setQuantity(event.target.value);
              setSuccess("");
            }}
            placeholder="Example: -2 or 5"
            className="w-full border rounded-lg p-3"
          />

          <p className="text-sm text-gray-600 mt-2">
            Use a negative number to remove stock and
            a positive number to add stock.
          </p>
        </div>

        <div>
          <label
            htmlFor="adjust-reason"
            className="block font-medium mb-2"
          >
            Reason
          </label>

          <textarea
            id="adjust-reason"
            value={reason}
            disabled={isProcessing}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Explain why stock needs adjustment"
            rows={3}
            className="w-full border rounded-lg p-3"
          />

          <p className="mt-2 text-sm text-amber-700">
            Development notice: reasons are not yet
            saved in the stock-movement audit record.
            This must be resolved before release.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleAdjustment()}
          disabled={
            isProcessing ||
            loadingLocations ||
            !product ||
            !selectedLocation
          }
          className="w-full bg-blue-700 text-white p-3 rounded-lg font-medium disabled:opacity-50"
        >
          {isProcessing
            ? "Processing adjustment..."
            : "Review & Confirm Adjustment"}
        </button>
      </div>
    </div>
  );
}
