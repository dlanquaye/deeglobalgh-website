"use client";

import {
  useState,
} from "react";
import { useRouter } from "next/navigation";

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
    saving,
    setSaving,
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

        <button
          type="button"
          onClick={() =>
            setEditing(
              true
            )
          }
          className="mt-2 rounded-lg border px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}
