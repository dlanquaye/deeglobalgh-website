"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateImportShipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    reference: "",
    supplierName: "",
    sourceApp: "ALIBABA",
    sourceAppOther: "",
    freightForwarderName: "",
    shippingMode: "SEA",
    currency: "USD",
    exchangeRateSnapshot: "",
    supplierDeclaredCbm: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/imports/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        exchangeRateSnapshot: Number(form.exchangeRateSnapshot),
        supplierDeclaredCbm: form.supplierDeclaredCbm
          ? Number(form.supplierDeclaredCbm)
          : undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create shipment");
      setLoading(false);
      return;
    }

    router.push("/admin/imports/shipments");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">
        Create Import Shipment (Draft)
      </h1>

      {error && (
        <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <input
          required
          placeholder="Reference"
          className="w-full rounded border px-3 py-2"
          value={form.reference}
          onChange={(e) =>
            setForm({ ...form, reference: e.target.value })
          }
        />

        <input
          required
          placeholder="Supplier Name"
          className="w-full rounded border px-3 py-2"
          value={form.supplierName}
          onChange={(e) =>
            setForm({ ...form, supplierName: e.target.value })
          }
        />

        <select
          className="w-full rounded border px-3 py-2"
          value={form.sourceApp}
          onChange={(e) =>
            setForm({ ...form, sourceApp: e.target.value })
          }
        >
          <option value="ALIBABA">Alibaba</option>
          <option value="APP_1688">1688</option>
          <option value="TAOBAO">Taobao</option>
          <option value="WECHAT">WeChat</option>
          <option value="OTHER">Other</option>
        </select>

        {form.sourceApp === "OTHER" && (
          <input
            placeholder="Other Source App"
            className="w-full rounded border px-3 py-2"
            value={form.sourceAppOther}
            onChange={(e) =>
              setForm({ ...form, sourceAppOther: e.target.value })
            }
          />
        )}

        <input
          required
          placeholder="Freight Forwarder Name"
          className="w-full rounded border px-3 py-2"
          value={form.freightForwarderName}
          onChange={(e) =>
            setForm({
              ...form,
              freightForwarderName: e.target.value,
            })
          }
        />

        <select
          className="w-full rounded border px-3 py-2"
          value={form.shippingMode}
          onChange={(e) =>
            setForm({ ...form, shippingMode: e.target.value })
          }
        >
          <option value="SEA">Sea</option>
          <option value="AIR">Air</option>
        </select>

        <input
          required
          placeholder="Currency (e.g. USD)"
          className="w-full rounded border px-3 py-2"
          value={form.currency}
          onChange={(e) =>
            setForm({ ...form, currency: e.target.value })
          }
        />

        <input
          required
          type="number"
          step="0.01"
          placeholder="Exchange Rate Snapshot"
          className="w-full rounded border px-3 py-2"
          value={form.exchangeRateSnapshot}
          onChange={(e) =>
            setForm({
              ...form,
              exchangeRateSnapshot: e.target.value,
            })
          }
        />

        <input
          type="number"
          step="0.01"
          placeholder="Supplier Declared CBM (optional)"
          className="w-full rounded border px-3 py-2"
          value={form.supplierDeclaredCbm}
          onChange={(e) =>
            setForm({
              ...form,
              supplierDeclaredCbm: e.target.value,
            })
          }
        />

        <div className="flex gap-3 pt-4">
          <button
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            {loading ? "Creating…" : "Create Shipment"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded bg-gray-200 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
