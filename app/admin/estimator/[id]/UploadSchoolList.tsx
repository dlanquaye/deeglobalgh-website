"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  estimateId: string;
}

export default function UploadSchoolList({
  estimateId,
}: Props) {
  const router = useRouter();

  const [uploading, setUploading] = useState(false);

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("estimateId", estimateId);
      formData.append("file", file);

      const res = await fetch(
        "/api/estimator/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message ?? "Upload failed.");
        setUploading(false);
        return;
      }

      alert("School list uploaded successfully.");

      router.refresh();

    } catch {
      alert("Upload failed.");
    }

    setUploading(false);

    e.target.value = "";
  }

  return (
    <div className="mb-8 rounded-xl border bg-white p-6">

      <h2 className="mb-2 text-xl font-bold">
        Upload School List
      </h2>

      <p className="mb-4 text-sm text-gray-600">
        Upload a PDF, JPG or PNG school list.
      </p>

      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        disabled={uploading}
        onChange={handleFileChange}
        className="block w-full rounded-lg border p-3"
      />

      {uploading && (
        <p className="mt-3 text-sm text-blue-600">
          Uploading...
        </p>
      )}

    </div>
  );
}