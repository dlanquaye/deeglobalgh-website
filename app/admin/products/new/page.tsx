"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // Core
    sku: "",
    name: "",
    slug: "",
    retailPrice: "",
    wholesalePrice: "",
    distributorPrice: "",
    stockQty: "",
    lowStockThreshold: "",
    categorySlug: "",
    levelSlugs: "",
    brand: "",

    // Image
    imageSrc: "",
    imageAlt: "",
    imageTitle: "",
    imageCaption: "",
    imageDescription: "",

    // SEO
    focusKeyphrase: "",
    metaTitle: "",
    metaDescription: "",
    socialTitle: "",
    socialDescription: "",

    // Content
    shortSummary: "",
    fullDescription: "",

    // Tags
    tags: "",
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

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          retailPrice: Number(form.retailPrice),
          wholesalePrice: form.wholesalePrice
            ? Number(form.wholesalePrice)
            : null,
          distributorPrice: form.distributorPrice
            ? Number(form.distributorPrice)
            : null,
          stockQty: Number(form.stockQty),
          lowStockThreshold: form.lowStockThreshold
            ? Number(form.lowStockThreshold)
            : 3,
          levelSlugs: form.levelSlugs
            ? form.levelSlugs
                .split(",")
                .map((s) =>
                  s.trim().toLowerCase().replace(/\s+/g, "-")
                )
            : [],
          tags: form.tags
            ? form.tags
                .split(",")
                .map((s) => s.trim().toLowerCase())
            : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error creating product");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      alert("Server error");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-blue-900">
        Admin • Create Product
      </h1>

      <div className="mt-6">
        <Link
          href="/admin/products"
          className="text-sm text-blue-900 underline"
        >
          ← Back to Products
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-8 rounded-2xl border bg-white p-8"
      >

        {/* CORE SECTION */}
        <SectionTitle title="Core Information" />

        <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} required />
        <Input label="Product Name" name="name" value={form.name} onChange={handleChange} required />
        <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} required />
        <Input label="Brand" name="brand" value={form.brand} onChange={handleChange} />

        <Input label="Retail Price (GH₵)" name="retailPrice" type="number" value={form.retailPrice} onChange={handleChange} required />
        <Input label="Wholesale Price (optional)" name="wholesalePrice" type="number" value={form.wholesalePrice} onChange={handleChange} />
        <Input label="Distributor Price (optional)" name="distributorPrice" type="number" value={form.distributorPrice} onChange={handleChange} />

        <Input label="Stock Quantity" name="stockQty" type="number" value={form.stockQty} onChange={handleChange} required />
        <Input label="Low Stock Threshold" name="lowStockThreshold" type="number" value={form.lowStockThreshold} onChange={handleChange} />

        <Input label="Category Slug" name="categorySlug" value={form.categorySlug} onChange={handleChange} required />
        <Input label="Level Slugs (comma separated)" name="levelSlugs" value={form.levelSlugs} onChange={handleChange} />

        {/* IMAGE SECTION */}
        <SectionTitle title="Image Information" />

        <Input label="Image Src" name="imageSrc" value={form.imageSrc} onChange={handleChange} required />
        <Input label="Image Alt" name="imageAlt" value={form.imageAlt} onChange={handleChange} required />
        <Input label="Image Title" name="imageTitle" value={form.imageTitle} onChange={handleChange} />
        <Input label="Image Caption" name="imageCaption" value={form.imageCaption} onChange={handleChange} />
        <Textarea label="Image Description" name="imageDescription" value={form.imageDescription} onChange={handleChange} />

        {/* SEO SECTION */}
        <SectionTitle title="SEO Settings" />

        <Input label="Focus Keyphrase" name="focusKeyphrase" value={form.focusKeyphrase} onChange={handleChange} />
        <Input label="Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} />
        <Textarea label="Meta Description" name="metaDescription" value={form.metaDescription} onChange={handleChange} />
        <Input label="Social Title" name="socialTitle" value={form.socialTitle} onChange={handleChange} />
        <Textarea label="Social Description" name="socialDescription" value={form.socialDescription} onChange={handleChange} />

        {/* CONTENT SECTION */}
        <SectionTitle title="Product Content" />

        <Textarea label="Short Summary" name="shortSummary" value={form.shortSummary} onChange={handleChange} />
        <Textarea label="Full Description" name="fullDescription" value={form.fullDescription} onChange={handleChange} rows={6} />

        {/* TAGS */}
        <SectionTitle title="Tags" />
        <Input label="Tags (comma separated)" name="tags" value={form.tags} onChange={handleChange} />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-900 px-4 py-3 font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="border-b pb-2 text-lg font-bold text-blue-900">
      {title}
    </h2>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full rounded-xl border px-4 py-3"
      />
    </div>
  );
}

function Textarea({
  label,
  name,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  rows?: number;
}) {
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