"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
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
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    productName,
    setProductName,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    unitPrice,
    setUnitPrice,
  ] = useState("");

  const [
    results,
    setResults,
  ] = useState<
    SearchProduct[]
  >([]);

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState("");

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<
    SearchProduct | null
  >(null);

  const [
    showResults,
    setShowResults,
  ] = useState(false);

  const [
    manualItem,
    setManualItem,
  ] = useState(false);

  useEffect(() => {
    if (
      manualItem
    ) {
      setResults([]);
      return;
    }

    const timer =
      setTimeout(
        async () => {
          if (
            productName
              .trim()
              .length <
            2
          ) {
            setResults(
              []
            );
            return;
          }

          try {
            const res =
              await fetch(
                `/api/products/search?query=${encodeURIComponent(
                  productName
                )}`
              );

            const data =
              await res.json();

            setResults(
              Array.isArray(
                data
              )
                ? data
                : []
            );
          } catch {
            setResults(
              []
            );
          }
        },
        250
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [
    productName,
    manualItem,
  ]);

  const calculatedTotal =
    useMemo(() => {
      const price =
        Number(
          unitPrice
        );

      if (
        !Number.isFinite(
          price
        ) ||
        price < 0 ||
        !Number.isFinite(
          quantity
        ) ||
        quantity <= 0
      ) {
        return null;
      }

      return (
        price *
        quantity
      );
    }, [
      unitPrice,
      quantity,
    ]);

  function chooseProduct(
    product: SearchProduct
  ) {
    setProductName(
      product.name
    );

    setSelectedProductId(
      product.id
    );

    setSelectedProduct(
      product
    );

    setUnitPrice(
      String(
        product.retailPrice
      )
    );

    setResults([]);
    setShowResults(
      false
    );

    setManualItem(
      false
    );
  }

  function switchToManualItem() {
    setManualItem(
      true
    );

    setSelectedProductId(
      ""
    );

    setSelectedProduct(
      null
    );

    setResults(
      []
    );

    setUnitPrice(
      ""
    );
  }

  function switchToCatalogueItem() {
    setManualItem(
      false
    );

    setSelectedProductId(
      ""
    );

    setSelectedProduct(
      null
    );

    setResults(
      []
    );

    setUnitPrice(
      ""
    );
  }

  function resetForm() {
    setProductName(
      ""
    );

    setSelectedProductId(
      ""
    );

    setSelectedProduct(
      null
    );

    setQuantity(
      1
    );

    setUnitPrice(
      ""
    );

    setResults(
      []
    );

    setManualItem(
      false
    );
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const cleanName =
      productName.trim();

    if (
      !cleanName
    ) {
      alert(
        "Enter an item description."
      );
      return;
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      alert(
        "Quantity must be a whole number greater than 0."
      );
      return;
    }

    if (
      !manualItem &&
      !selectedProductId
    ) {
      alert(
        "Select a catalogue product, or choose Manual Item for something not in the catalogue."
      );
      return;
    }

    if (
      unitPrice.trim() ===
      ""
    ) {
      alert(
        "Enter the quotation unit price."
      );
      return;
    }

    const parsedUnitPrice =
      Number(
        unitPrice
      );

    if (
      !Number.isFinite(
        parsedUnitPrice
      ) ||
      parsedUnitPrice <
        0
    ) {
      alert(
        "Unit price must be 0 or greater."
      );
      return;
    }

    setLoading(
      true
    );

    try {
      const res =
        await fetch(
          "/api/estimator/items",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                estimateId,

                productId:
                  manualItem
                    ? undefined
                    : selectedProductId,

                productName:
                  cleanName,

                quantity,

                unitPrice:
                  parsedUnitPrice,

                manualItem,
              }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ??
            "Unable to add item."
        );

        return;
      }

      resetForm();

      router.refresh();
    } catch {
      alert(
        "Server error."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="mb-8 rounded-xl border bg-white p-6"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-xl font-bold">
            Add Quotation Item
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Quote stocked products, zero-stock products, or items not yet in your catalogue.
          </p>
        </div>

        <div className="flex rounded-lg border bg-gray-50 p-1">
          <button
            type="button"
            onClick={
              switchToCatalogueItem
            }
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              !manualItem
                ? "bg-blue-900 text-white"
                : "text-gray-700 hover:bg-white"
            }`}
          >
            Catalogue Product
          </button>

          <button
            type="button"
            onClick={
              switchToManualItem
            }
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              manualItem
                ? "bg-blue-900 text-white"
                : "text-gray-700 hover:bg-white"
            }`}
          >
            Manual Item
          </button>
        </div>
      </div>

      <div className="mt-6">

        <label className="mb-2 block text-sm font-semibold text-gray-800">
          {manualItem
            ? "Item Description"
            : "Search Catalogue Product"}
        </label>

        <div className="relative">

          <input
            className="w-full rounded-lg border px-4 py-3"
            placeholder={
              manualItem
                ? "e.g. HP LaserJet Pro M404dn Printer"
                : "Type product or book name..."
            }
            value={
              productName
            }
            onFocus={() =>
              !manualItem &&
              setShowResults(
                true
              )
            }
            onBlur={() =>
              setTimeout(
                () =>
                  setShowResults(
                    false
                  ),
                200
              )
            }
            onChange={(e) => {
              setProductName(
                e.target.value
              );

              if (
                !manualItem
              ) {
                setSelectedProductId(
                  ""
                );

                setSelectedProduct(
                  null
                );

                setUnitPrice(
                  ""
                );
              }
            }}
            required
          />

          {!manualItem &&
            showResults &&
            results.length >
              0 && (

              <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">

                {results.map(
                  (
                    product
                  ) => (

                    <button
                      key={
                        product.id
                      }
                      type="button"
                      onClick={() =>
                        chooseProduct(
                          product
                        )
                      }
                      className="block w-full border-b px-4 py-3 text-left hover:bg-gray-100"
                    >
                      <div className="font-medium">
                        {
                          product.name
                        }
                      </div>

                      <div className="mt-1 text-sm text-gray-500">
                        {
                          product.sku
                        }{" "}
                        · GHS{" "}
                        {
                          product.retailPrice
                        }{" "}
                        · Stock{" "}
                        {
                          product.stockQty
                        }
                      </div>

                      {product.stockQty ===
                        0 && (
                        <div className="mt-1 text-xs font-semibold text-amber-700">
                          Zero stock — still available for quotation
                        </div>
                      )}

                    </button>

                  )
                )}

              </div>

            )}

        </div>

        {!manualItem &&
          selectedProduct && (

          <div className="mt-3 rounded-lg border bg-blue-50 p-3 text-sm">
            <div className="font-semibold text-blue-900">
              Selected catalogue product
            </div>

            <div className="mt-1 text-gray-700">
              {
                selectedProduct.name
              }
            </div>

            <div className="mt-1 text-gray-600">
              SKU:{" "}
              {
                selectedProduct.sku
              }{" "}
              · Catalogue retail price: GHS{" "}
              {
                selectedProduct.retailPrice
              }{" "}
              · Current stock:{" "}
              {
                selectedProduct.stockQty
              }
            </div>

            <div className="mt-1 text-xs font-medium text-gray-600">
              You can change the quotation price below. It will not alter the catalogue retail price.
            </div>
          </div>
        )}

        {manualItem && (
          <div className="mt-3 rounded-lg border bg-amber-50 p-3 text-sm text-amber-900">
            Manual items do not need a catalogue product, SKU, or current stock record.
          </div>
        )}

      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Quantity
          </label>

          <input
            type="number"
            min={
              1
            }
            step={
              1
            }
            className="w-full rounded-lg border px-4 py-3"
            value={
              quantity
            }
            onChange={(e) =>
              setQuantity(
                Number(
                  e.target.value
                )
              )
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Quotation Unit Price
          </label>

          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500">
              GHS
            </span>

            <input
              type="number"
              min={
                0
              }
              step="0.01"
              className="w-full rounded-lg border py-3 pl-14 pr-4"
              placeholder="0.00"
              value={
                unitPrice
              }
              onChange={(e) =>
                setUnitPrice(
                  e.target.value
                )
              }
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Line Total
          </label>

          <div className="rounded-lg border bg-gray-50 px-4 py-3 font-bold text-gray-900">
            {calculatedTotal !==
            null
              ? `GHS ${calculatedTotal.toFixed(
                  2
                )}`
              : "GHS 0.00"}
          </div>
        </div>

      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">

        <button
          disabled={
            loading
          }
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Adding..."
            : manualItem
              ? "Add Manual Item"
              : "Add Catalogue Item"}
        </button>

        <div className="text-sm text-gray-500">
          Stock quantity does not prevent an item from being quoted.
        </div>

      </div>

    </form>
  );
}
