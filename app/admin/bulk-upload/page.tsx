"use client";

import { useState } from "react";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const [importType, setImportType] = useState("products");

  const fileSize =
  file ? (file.size / 1024 / 1024).toFixed(2) : null;

  const handleAnalyze = async () => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    
    formData.append("importType", importType);

    // TEMPORARY: This still calls the legacy bulk upload API.
// It will be replaced by the Catalog Synchronization API.

    const res = await fetch("/api/admin/catalog", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`✅ Uploaded ${data.count} products successfully`);
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  };

  return (
<main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
  <h1 className="text-3xl font-bold text-blue-900">
Catalog Synchronization Centre
</h1>

  <p className="mt-2 text-gray-600">
    Import products, validate your catalogue, update stock, and manage large product uploads from a single location.
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
onChange={(e) => setImportType(e.target.value)}
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
    onChange={(e) => setFile(e.target.files?.[0] || null)}
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
    type="button"
    disabled
    className="rounded-xl border px-6 py-3 font-semibold text-gray-400"
  >
    Synchronize Catalog
  </button>
</div>

  {message && (
    <div className="mt-6 rounded-xl border bg-gray-50 p-4">
      {message}
    </div>
  )}

</div>
    </main>
  );
}