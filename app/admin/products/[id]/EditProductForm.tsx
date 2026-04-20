"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProductForm({ product }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Phase 1 – Core
    name: product.name || "",
    sku: product.sku || "",
    slug: product.slug || "",
    retailPrice: product.retailPrice || "",
    stockQty: product.stockQty || "",
    brand: product.brand || "",
    shortSummary: product.shortSummary || "",
    fullDescription: product.fullDescription || "",

    // Phase 2 – SEO
    focusKeyphrase: product.focusKeyphrase || "",
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDescription || "",
    socialTitle: product.socialTitle || "",
    socialDescription: product.socialDescription || "",

    // Image SEO
    imageTitle: product.imageTitle || "",
    imageCaption: product.imageCaption || "",
    imageDescription: product.imageDescription || "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        retailPrice: Number(form.retailPrice),
        stockQty: Number(form.stockQty),
      }),
    });

    if (!res.ok) {
      alert("Error updating product");
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* HEADER */}
      <h1 className="text-2xl font-bold text-blue-900">
        Edit Product
      </h1>

      {/* PHASE TOGGLE + BACK BUTTON */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              step === 1 ? "bg-blue-900 text-white" : "border"
            }`}
          >
            Phase 1 • Core
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              step === 2 ? "bg-blue-900 text-white" : "border"
            }`}
          >
            Phase 2 • SEO
          </button>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          ← Back to Products
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-8 rounded-2xl border bg-white p-8"
      >
        {/* =========================
            PHASE 1 – CORE PRODUCT
        ========================== */}
        {step === 1 && (
          <>
            <Section title="Core Product Information" />
            <Input label="Product Name" name="name" value={form.name} onChange={handleChange} />
            <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} />
            <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} />

            <Section title="Pricing & Inventory" />
            <Input label="Retail Price" name="retailPrice" value={form.retailPrice} onChange={handleChange} />
            <Input label="Stock Quantity" name="stockQty" value={form.stockQty} onChange={handleChange} />

            <Section title="Brand & Content" />
            <Input label="Brand" name="brand" value={form.brand} onChange={handleChange} />
            <Textarea label="Short Summary" name="shortSummary" value={form.shortSummary} onChange={handleChange} />
            <Textarea label="Full Description" name="fullDescription" value={form.fullDescription} onChange={handleChange} rows={6} />

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-blue-900 px-4 py-3 font-bold text-white"
            >
              Continue to SEO →
            </button>
          </>
        )}

        {/* =========================
            PHASE 2 – SEO
        ========================== */}
        {step === 2 && (
          <>
            <Section title="SEO Settings" />
            <Input label="Focus Keyphrase" name="focusKeyphrase" value={form.focusKeyphrase} onChange={handleChange} />
            <Input label="Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} />
            <Textarea label="Meta Description" name="metaDescription" value={form.metaDescription} onChange={handleChange} />
            <Input label="Social Title" name="socialTitle" value={form.socialTitle} onChange={handleChange} />
            <Textarea label="Social Description" name="socialDescription" value={form.socialDescription} onChange={handleChange} />

            <Section title="Image SEO" />
            <Input label="Image Title" name="imageTitle" value={form.imageTitle} onChange={handleChange} />
            <Input label="Image Caption" name="imageCaption" value={form.imageCaption} onChange={handleChange} />
            <Textarea label="Image Description" name="imageDescription" value={form.imageDescription} onChange={handleChange} />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border px-4 py-3 font-bold"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-blue-900 px-4 py-3 font-bold text-white"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </form>
    </main>
  );
}

function Section({ title }: { title: string }) {
  return (
    <h2 className="border-b pb-2 text-lg font-bold text-blue-900">
      {title}
    </h2>
  );
}

function Input({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border px-4 py-3"
      />
    </div>
  );
}

function Textarea({ label, name, value, onChange, rows = 3 }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="mt-1 w-full rounded-xl border px-4 py-3"
      />
    </div>
  );
}