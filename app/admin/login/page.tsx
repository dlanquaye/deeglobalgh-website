"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] =
    useState("");

  const [pin, setPin] =
    useState("");

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin-login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              pin,
            }),
          }
        );

      const data =
        await response.json();

      if (response.ok) {
        window.location.href =
          data.mustChangeCredential
            ? "/admin/account"
            : "/admin";

        return;
      }

      setError(
        data.error ||
          "Login failed"
      );
    } catch {
      setError(
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={
          handleSubmit
        }
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="mb-6 text-center text-xl font-bold">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(
            event
          ) =>
            setEmail(
              event.target.value
            )
          }
          className="mb-4 w-full rounded border px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(
            event
          ) =>
            setPin(
              event.target.value
            )
          }
          className="mb-4 w-full rounded border px-3 py-2"
          required
        />

        {error && (
          <p className="mb-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>
    </main>
  );
}
