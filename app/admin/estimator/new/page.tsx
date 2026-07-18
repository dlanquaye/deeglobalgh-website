"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewEstimatePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    schoolName: "",
    className: "",
    academicYear: "",
    notes: "",
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
      const res = await fetch("/api/estimator/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          source: "WEBSITE",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create estimate.");
        setLoading(false);
        return;
      }

      router.push("/admin/estimator");
      router.refresh();

    } catch {
      alert("Server error.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">

      <h1 className="text-3xl font-bold">
        New School List Estimate
      </h1>

      <p className="mt-2 text-gray-600">
        Create a new estimate request.
      </p>

      <div className="mt-6">
        <Link
          href="/admin/estimator"
          className="text-sm text-blue-700 underline"
        >
          ← Back to Estimates
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-xl border bg-white p-6"
      >

        <Input
          label="Customer Name"
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <Input
          label="School"
          name="schoolName"
          value={form.schoolName}
          onChange={handleChange}
        />

        <Input
          label="Class"
          name="className"
          value={form.className}
          onChange={handleChange}
        />

        <Input
          label="Academic Year"
          name="academicYear"
          value={form.academicYear}
          onChange={handleChange}
        />

        <Textarea
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Estimate"}
        </button>

      </form>

    </main>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold">
        {label}
      </label>

      <input
        type="text"
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
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="mt-1 w-full rounded-xl border px-4 py-3"
      />
    </div>
  );
}