"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ enables Enter key submit

    if (!secret.trim()) {
      setError("Admin PIN is required");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      if (!res.ok) {
        setError("Invalid admin PIN");
        setLoading(false);
        return;
      }

      // ✅ Login success → redirect to admin
      window.location.href = "/admin/db-orders";
    } catch {
      setError("Login failed");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="text-2xl font-extrabold text-[color:var(--brand-blue)]">
        Admin Login
      </h1>

      {/* ✅ FORM ENABLES ENTER KEY */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="password"
          placeholder="Enter Admin PIN"
          className="input-brand h-14 w-full text-center text-lg"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          disabled={loading}
          autoFocus
        />

        {error && (
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit" // ✅ important
          disabled={loading || !secret}
          className="btn-primary w-full py-4 text-lg font-extrabold"
        >
          {loading ? "Checking..." : "Login"}
        </button>
      </form>
    </main>
  );
}
