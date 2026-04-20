"use client";

import { useState } from "react";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/products/bulk", {
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
    <div style={{ padding: "20px" }}>
      <h1>Bulk Upload Products</h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Upload CSV
      </button>

      <p>{message}</p>
    </div>
  );
}