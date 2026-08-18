"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuotationDateControl({
  estimateId,
  initialDate,
}: {
  estimateId: string;
  initialDate: string;
}) {
  const router =
    useRouter();

  const [
    quotationDate,
    setQuotationDate,
  ] = useState(
    initialDate
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  async function saveDate() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/admin/estimator/${estimateId}/quotation-date`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                quotationDate,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save quotation date."
        );
      }

      setMessage(
        "Quotation date saved."
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save quotation date."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border bg-gray-50 p-4 print:hidden">
      <div className="text-sm font-bold text-gray-900">
        Quotation Date
      </div>

      <p className="mt-1 text-xs text-gray-600">
        This is the date printed on the customer quotation.
        The internal issued timestamp remains unchanged.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={quotationDate}
          onChange={(event) =>
            setQuotationDate(
              event.target.value
            )
          }
          className="rounded-lg border bg-white px-3 py-2"
        />

        <button
          type="button"
          onClick={saveDate}
          disabled={
            saving ||
            !quotationDate
          }
          className="rounded-lg bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : "Save Date"}
        </button>
      </div>

      {message && (
        <p className="mt-2 text-sm font-medium text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
