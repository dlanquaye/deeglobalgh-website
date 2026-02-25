"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProductForm({ product }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    brand: product.brand || "",
    imageTitle: product.imageTitle || "",
    imageCaption: product.imageCaption || "",
    imageDescription: product.imageDescription || "",
    focusKeyphrase: product.focusKeyphrase || "",
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDescription || "",
    socialTitle: product.socialTitle || "",
    socialDescription: product.socialDescription || "",
    shortSummary: product.shortSummary || "",
    fullDescription: product.fullDescription || "",
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
      body: JSON.stringify(form),
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
      <h1 className="text-2xl font-bold text-blue-900">
        Edit Product Content
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-2xl border bg-white p-8"
      >
        <Section title="Brand" />
        <Input label="Brand" name="brand" value={form.brand} onChange={handleChange} />

        <Section title="Image SEO" />
        <Input label="Image Title" name="imageTitle" value={form.imageTitle} onChange={handleChange} />
        <Input label="Image Caption" name="imageCaption" value={form.imageCaption} onChange={handleChange} />
        <Textarea label="Image Description" name="imageDescription" value={form.imageDescription} onChange={handleChange} />

        <Section title="SEO Settings" />
        <Input label="Focus Keyphrase" name="focusKeyphrase" value={form.focusKeyphrase} onChange={handleChange} />
        <Input label="Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} />
        <Textarea label="Meta Description" name="metaDescription" value={form.metaDescription} onChange={handleChange} />
        <Input label="Social Title" name="socialTitle" value={form.socialTitle} onChange={handleChange} />
        <Textarea label="Social Description" name="socialDescription" value={form.socialDescription} onChange={handleChange} />

        <Section title="Content" />
        <Textarea label="Short Summary" name="shortSummary" value={form.shortSummary} onChange={handleChange} />
        <Textarea label="Full Description" name="fullDescription" value={form.fullDescription} onChange={handleChange} rows={6} />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-900 px-4 py-3 font-bold text-white"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
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