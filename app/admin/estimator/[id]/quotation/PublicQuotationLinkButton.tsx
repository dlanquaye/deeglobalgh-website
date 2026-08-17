"use client";

import { useState } from "react";

export default function PublicQuotationLinkButton({
  estimateId,
}: {
  estimateId: string;
}) {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  async function copyLink() {
    setLoading(true);
    setCopied(false);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/admin/estimator/${estimateId}/public-link`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.url
      ) {
        throw new Error(
          data?.error ||
            "Unable to create customer link."
        );
      }

      await navigator.clipboard.writeText(
        data.url
      );

      setCopied(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to copy customer link."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={copyLink}
        disabled={loading}
        className="rounded bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Creating Link..."
          : copied
            ? "Customer Link Copied"
            : "Copy Customer Link"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
