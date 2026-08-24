"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

interface SearchProduct {
  id: string;
  sku: string;
  name: string;
  retailPrice: number;
  stockQty: number;
}

interface Props {
  estimateId: string;

  item: {
    id: string;
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: number | null;
    totalPrice: number | null;
    matchConfidence: number | null;

    product: {
      name: string;
    } | null;
  };
}

export default function EstimateItemRow({
  estimateId,
  item,
}: Props) {
  const router =
    useRouter();

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    replacing,
    setReplacing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    replacingProduct,
    setReplacingProduct,
  ] = useState(false);

  const [
    description,
    setDescription,
  ] = useState(
    item.description
  );

  const [
    quantity,
    setQuantity,
  ] = useState(
    item.quantity
  );

  const [
    unitPrice,
    setUnitPrice,
  ] = useState(
    item.unitPrice != null
      ? String(
          item.unitPrice
        )
      : ""
  );

  const [
    productQuery,
    setProductQuery,
  ] = useState("");

  const [
    productResults,
    setProductResults,
  ] = useState<
    SearchProduct[]
  >([]);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<
    SearchProduct | null
  >(null);

  const [
    showProductResults,
    setShowProductResults,
  ] = useState(false);

  useEffect(() => {
    if (
      !replacing
    ) {
      return;
    }

    const query =
      productQuery.trim();

    if (
      query.length < 2
    ) {
      setProductResults(
        []
      );

      return;
    }

    const timer =
      setTimeout(
        async () => {
          try {
            const response =
              await fetch(
                `/api/products/search?query=${encodeURIComponent(
                  query
                )}`
              );

            const data =
              await response.json();

            setProductResults(
              Array.isArray(
                data
              )
                ? data
                : []
            );
          } catch {
            setProductResults(
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
    productQuery,
    replacing,
  ]);

  const parsedPrice =
    Number(
      unitPrice
    );

  const calculatedTotal =
    Number.isFinite(
      parsedPrice
    ) &&
    parsedPrice >= 0 &&
    Number.isInteger(
      quantity
    ) &&
    quantity > 0
      ? parsedPrice *
        quantity
      : null;

  function cancelEdit() {
    setDescription(
      item.description
    );

    setQuantity(
      item.quantity
    );

    setUnitPrice(
      item.unitPrice != null
        ? String(
            item.unitPrice
          )
        : ""
    );

    setEditing(
      false
    );
  }

  function startReplacement() {
    setReplacing(
      true
    );

    setSelectedProduct(
      null
    );

    setProductResults(
      []
    );

    setProductQuery(
      item.product?.name ??
        item.description
    );

    setShowProductResults(
      true
    );
  }

  function cancelReplacement() {
    setReplacing(
      false
    );

    setSelectedProduct(
      null
    );

    setProductResults(
      []
    );

    setProductQuery(
      ""
    );

    setShowProductResults(
      false
    );
  }

  function chooseReplacementProduct(
    product: SearchProduct
  ) {
    setSelectedProduct(
      product
    );

    setProductQuery(
      product.name
    );

    setProductResults(
      []
    );

    setShowProductResults(
      false
    );
  }

  async function saveEdit() {
    const cleanDescription =
      description.trim();

    if (
      !cleanDescription
    ) {
      alert(
        "Item description is required."
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
      unitPrice.trim() ===
      ""
    ) {
      alert(
        "Enter the quotation unit price."
      );

      return;
    }

    const price =
      Number(
        unitPrice
      );

    if (
      !Number.isFinite(
        price
      ) ||
      price < 0
    ) {
      alert(
        "Unit price must be 0 or greater."
      );

      return;
    }

    setSaving(
      true
    );

    try {
      const response =
        await fetch(
          `/api/estimator/items/${item.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                estimateId,

                description:
                  cleanDescription,

                quantity,

                unitPrice:
                  price,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data?.message ??
            "Unable to update quotation item."
        );
      }

      setEditing(
        false
      );

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update quotation item."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  async function replaceProduct() {
    if (
      !selectedProduct
    ) {
      alert(
        "Select a catalogue product first."
      );

      return;
    }

    setReplacingProduct(
      true
    );

    try {
      const response =
        await fetch(
          `/api/estimator/items/${item.id}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                estimateId,

                productId:
                  selectedProduct.id,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data?.message ??
            "Unable to replace quotation product."
        );
      }

      cancelReplacement();

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to replace quotation product."
      );
    } finally {
      setReplacingProduct(
        false
      );
    }
  }

  async function deleteItem() {
    const confirmed =
      window.confirm(
        `Delete "${item.description}" from this estimate?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDeleting(
      true
    );

    try {
      const response =
        await fetch(
          `/api/estimator/items/${item.id}`,
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                estimateId,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data?.message ??
            "Unable to delete quotation item."
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete quotation item."
      );
    } finally {
      setDeleting(
        false
      );
    }
  }

  if (
    replacing
  ) {
    return (
      <tr className="border-t bg-amber-50/40">
        <td className="px-4 py-3 align-top">
          {
            item.lineNumber
          }
        </td>

        <td className="px-4 py-3 align-top">
          <div className="font-medium">
            {
              item.description
            }
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Quantity:{" "}
            {
              item.quantity
            }
          </div>
        </td>

        <td
          colSpan={4}
          className="px-4 py-3 align-top"
        >
          <div className="max-w-2xl">

            <label className="block text-sm font-semibold text-gray-800">
              Search replacement catalogue product
            </label>

            <div className="relative mt-2">

              <input
                value={
                  productQuery
                }
                onFocus={() =>
                  setShowProductResults(
                    true
                  )
                }
                onBlur={() =>
                  setTimeout(
                    () =>
                      setShowProductResults(
                        false
                      ),
                    200
                  )
                }
                onChange={(e) => {
                  setProductQuery(
                    e.target.value
                  );

                  setSelectedProduct(
                    null
                  );

                  setShowProductResults(
                    true
                  );
                }}
                placeholder="Type product name or SKU..."
                className="w-full rounded-lg border bg-white px-4 py-3"
              />

              {showProductResults &&
                productResults.length >
                  0 && (

                <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">

                  {productResults.map(
                    (
                      product
                    ) => (

                      <button
                        key={
                          product.id
                        }
                        type="button"
                        onClick={() =>
                          chooseReplacementProduct(
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

            {selectedProduct && (
              <div className="mt-3 rounded-lg border bg-white p-3 text-sm">

                <div className="font-semibold text-gray-900">
                  Selected replacement
                </div>

                <div className="mt-1">
                  {
                    selectedProduct.name
                  }
                </div>

                <div className="mt-1 text-gray-600">
                  SKU:{" "}
                  {
                    selectedProduct.sku
                  }{" "}
                  · Retail price: GHS{" "}
                  {
                    selectedProduct.retailPrice
                  }{" "}
                  · Stock:{" "}
                  {
                    selectedProduct.stockQty
                  }
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Replacing an estimate item does not change or reserve inventory.
                </div>

              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">

              <button
                type="button"
                onClick={
                  replaceProduct
                }
                disabled={
                  replacingProduct ||
                  !selectedProduct
                }
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {replacingProduct
                  ? "Replacing..."
                  : "Replace Product"}
              </button>

              <button
                type="button"
                onClick={
                  cancelReplacement
                }
                disabled={
                  replacingProduct
                }
                className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </div>
        </td>
      </tr>
    );
  }

  if (
    editing
  ) {
    return (
      <tr className="border-t bg-blue-50/40">
        <td className="px-4 py-3 align-top">
          {
            item.lineNumber
          }
        </td>

        <td className="px-4 py-3 align-top">
          <textarea
            value={
              description
            }
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            rows={
              2
            }
            className="w-full rounded-lg border bg-white px-3 py-2"
          />
        </td>

        <td className="px-4 py-3 align-top">
          <div className="text-sm font-medium text-gray-800">
            {item.product
              ?.name ??
              "Manual Item"}
          </div>

          {item.product && (
            <div className="mt-1 text-xs text-gray-500">
              Catalogue link is preserved.
            </div>
          )}
        </td>

        <td className="px-4 py-3 align-top">
          <input
            type="number"
            min={
              1
            }
            step={
              1
            }
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
            className="w-24 rounded-lg border bg-white px-3 py-2"
          />
        </td>

        <td className="px-4 py-3 align-top">
          {item.matchConfidence ??
            "-"}
          %
        </td>

        <td className="px-4 py-3 align-top">
          <div className="space-y-2">

            <div>
              <label className="block text-xs font-semibold text-gray-600">
                Unit Price
              </label>

              <input
                type="number"
                min={
                  0
                }
                step="0.01"
                value={
                  unitPrice
                }
                onChange={(e) =>
                  setUnitPrice(
                    e.target.value
                  )
                }
                className="mt-1 w-32 rounded-lg border bg-white px-3 py-2"
              />
            </div>

            <div className="text-sm font-bold text-gray-900">
              Total:{" "}
              {calculatedTotal !=
              null
                ? `GHS ${calculatedTotal.toFixed(
                    2
                  )}`
                : "GHS 0.00"}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">

              <button
                type="button"
                onClick={
                  saveEdit
                }
                disabled={
                  saving
                }
                className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>

              <button
                type="button"
                onClick={
                  cancelEdit
                }
                disabled={
                  saving
                }
                className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t">

      <td className="px-4 py-3">
        {
          item.lineNumber
        }
      </td>

      <td className="px-4 py-3">
        {
          item.description
        }
      </td>

      <td className="px-4 py-3">
        {item.product
          ?.name ??
          "Manual Item"}
      </td>

      <td className="px-4 py-3">
        {
          item.quantity
        }
      </td>

      <td className="px-4 py-3">
        {item.matchConfidence ??
          "-"}
        %
      </td>

      <td className="px-4 py-3">

        <div className="font-semibold">
          {item.totalPrice !=
          null
            ? `GHS ${item.totalPrice.toFixed(
                2
              )}`
            : "-"}
        </div>

        <div className="mt-1 text-xs text-gray-500">
          Unit:{" "}
          {item.unitPrice !=
          null
            ? `GHS ${item.unitPrice.toFixed(
                2
              )}`
            : "-"}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              setEditing(
                true
              )
            }
            disabled={
              deleting
            }
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50 disabled:opacity-50"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={
              startReplacement
            }
            disabled={
              deleting
            }
            className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
          >
            Replace
          </button>

          <button
            type="button"
            onClick={
              deleteItem
            }
            disabled={
              deleting
            }
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </td>
    </tr>
  );
}