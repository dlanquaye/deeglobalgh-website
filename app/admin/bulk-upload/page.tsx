"use client";

import { useState } from "react";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<any[]>([]);
  const [syncItems, setSyncItems] = useState<any[]>([]);

  const [importType, setImportType] = useState("products");
  const [isValidated, setIsValidated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(false);

  const clearAnalysis = () => {
    setPreview([]);
    setSyncItems([]);
    setIsValidated(false);
    setMessage("");
  };

  const formatPrice = (value: unknown) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "Invalid price";
    }

    return "GH₵" + numericValue.toFixed(2);
  };

  const fileSize =
    file ? (file.size / 1024 / 1024).toFixed(2) : null;

  const handleAnalyze = async () => {
    clearAnalysis();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("importType", importType);

      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      const analysis = data?.analysis;

      if (!res.ok || !analysis) {
        setMessage(data?.error ?? "Catalogue analysis failed.");
        return;
      }

      const valid =
        analysis.status === "VALIDATED" &&
        Array.isArray(analysis.syncItems) &&
        analysis.syncItems.length > 0;

      setPreview(
        Array.isArray(analysis.preview) ? analysis.preview : []
      );

      setSyncItems(valid ? analysis.syncItems : []);
      setIsValidated(valid);

      if (valid) {
        setMessage(
          `Validation successful.

Total Products: ${analysis.totalRows}
New Products: ${analysis.newProducts}
Existing Products: ${analysis.existingProducts}
Ready for Synchronization: ${analysis.validRows}`
        );
      } else {
        const errors = Array.isArray(analysis.errors)
          ? analysis.errors.join("\n")
          : "No valid products were found.";

        setMessage(`Validation failed.\n${errors}`);
      }
    } catch {
      setMessage("Unable to analyse the selected file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSynchronize = async () => {
    if (
      !isValidated ||
      syncItems.length === 0 ||
      isSynchronizing ||
      isAnalyzing
    ) {
      return;
    }

    const confirmed = window.confirm(
      importType === "price"
        ? `Apply commercial price changes to ${syncItems.length} existing products?`
        : `Synchronize ${syncItems.length} catalogue items?`
    );

    if (!confirmed) return;

    setIsSynchronizing(true);
    setIsValidated(false);

    try {
      const res = await fetch("/api/admin/catalog/synchronize", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          importType,
          syncItems,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        const errors = Array.isArray(data?.errors)
          ? data.errors.join("\n")
          : data?.error ?? "Synchronization failed.";

        setMessage(errors);
        return;
      }

      const report = data.report;

      setMessage(
        `Synchronization complete.

Updated: ${report.updated}
Inserted: ${report.inserted}
Review: ${report.review}
Errors: ${report.errors ?? 0}`
      );

      setSyncItems([]);
    } catch {
      setMessage("Unable to synchronize catalogue.");
    } finally {
      setIsSynchronizing(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">
          Catalog Synchronization Centre
        </h1>

        <p className="mt-2 text-gray-600">
          Import products, validate your catalogue, update stock, and manage
          large product uploads from a single location.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-6">
        {[
          "1. Template",
          "2. Import Type",
          "3. Upload",
          "4. Validate",
          "5. Preview",
          "6. Synchronize",
        ].map((step, index) => (
          <div
            key={index}
            className={`rounded-xl border p-4 text-center ${
              index === 2
                ? "border-blue-600 bg-blue-50 text-blue-900"
                : "bg-gray-50"
            }`}
          >
            <div className="font-semibold">{step}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Products in Database
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-900">
            153
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Last Import
          </p>

          <p className="mt-2 font-semibold">
            —
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Imports Today
          </p>

          <p className="mt-2 text-3xl font-bold text-green-700">
            0
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending Validation
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            0
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Import Type
        </label>

        <select
          className="w-full rounded-xl border p-3"
          value={importType}
          onChange={(e) => {
            setImportType(e.target.value);
            clearAnalysis();
          }}
        >
          <option value="products">
            📦 New Products
          </option>

          <option value="update">
            🔄 Update Existing Products
          </option>

          <option value="stock">
            📊 Stock Update
          </option>

          <option value="price">
            💰 Price Update
          </option>

          <option value="seo">
            🔍 SEO Update
          </option>

          <option value="images">
            🖼 Image Mapping
          </option>
        </select>
      </div>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">
          Synchronize Master Catalog
        </h2>

        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            clearAnalysis();
          }}
          className="block w-full rounded-xl border p-4"
        />

        {file && (
          <div className="mt-6 rounded-xl border bg-gray-50 p-5">
            <h3 className="mb-4 text-lg font-semibold">
              Selected File
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  File Name
                </p>

                <p className="font-semibold">
                  {file.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  File Size
                </p>

                <p className="font-semibold">
                  {fileSize} MB
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Import Type
                </p>

                <p className="font-semibold">
                  {importType === "products" && "📦 New Products"}
                  {importType === "update" && "🔄 Update Existing Products"}
                  {importType === "stock" && "📊 Stock Update"}
                  {importType === "price" && "💰 Price Update"}
                  {importType === "seo" && "🔍 SEO Update"}
                  {importType === "images" && "🖼 Image Mapping"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  Ready for Validation
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleAnalyze}
            className="rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Analyze Catalog
          </button>

          <button
            onClick={handleSynchronize}
            disabled={
              !isValidated ||
              syncItems.length === 0 ||
              isSynchronizing ||
              isAnalyzing
            }
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Synchronize Catalog
          </button>
        </div>

        {message && (
          <div className="mt-6 rounded-xl border bg-gray-50 p-4">
            {message}
          </div>
        )}

        {preview.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">
                    SKU
                  </th>

                  <th className="border px-3 py-2 text-left">
                    Product
                  </th>

                  <th className="border px-3 py-2 text-left">
                    Action
                  </th>

                  <th className="border px-3 py-2 text-left">
                    Match Type
                  </th>

                  {importType === "price" && (
                    <>
                      <th className="border px-3 py-2 text-right">
                        New Cost Price (GH₵)
                      </th>

                      <th className="border px-3 py-2 text-right">
                        New Wholesale Price (GH₵)
                      </th>

                      <th className="border px-3 py-2 text-right">
                        New Retail Price (GH₵)
                      </th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {preview.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-3 py-2">
                      {item.sku}
                    </td>

                    <td className="border px-3 py-2">
                      {item.name ?? item.productName}
                    </td>

                    <td className="border px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.action === "UPDATE"
                            ? "bg-green-100 text-green-800"
                            : item.action === "INSERT"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.action}
                      </span>
                    </td>

                    <td className="border px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.matchType === "SKU"
                            ? "bg-green-100 text-green-800"
                            : item.matchType === "SLUG"
                            ? "bg-blue-100 text-blue-800"
                            : item.matchType === "NAME"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {item.matchType}
                      </span>
                    </td>

                    {importType === "price" && (
                      <>
                        <td className="border px-3 py-2 text-right">
                          {formatPrice(item.costPrice)}
                        </td>

                        <td className="border px-3 py-2 text-right">
                          {formatPrice(item.wholesalePrice)}
                        </td>

                        <td className="border px-3 py-2 text-right">
                          {formatPrice(item.retailPrice)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}