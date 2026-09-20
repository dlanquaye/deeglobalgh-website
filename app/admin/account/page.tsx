"use client";

import Link from "next/link";
import {
  useState,
} from "react";

export default function AdminAccountPage() {
  const [
    currentPin,
    setCurrentPin,
  ] =
    useState("");

  const [
    newPin,
    setNewPin,
  ] =
    useState("");

  const [
    confirmPin,
    setConfirmPin,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (
      !currentPin ||
      !newPin ||
      !confirmPin
    ) {
      setError(
        "Complete all PIN fields."
      );

      return;
    }

    if (
      newPin !==
      confirmPin
    ) {
      setError(
        "New PIN and confirmation do not match."
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/account/change-credential",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              currentPin,
              newPin,
              confirmPin,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to change PIN."
        );

        return;
      }

      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");

      setSuccess(
        data.message ||
          "PIN changed successfully."
      );

      /*
       * Changing the credential increments
       * credentialVersion in the database.
       *
       * The current signed session therefore
       * becomes invalid immediately.
       *
       * Redirect to login after a short delay
       * so the user can read the confirmation.
       */
      window.setTimeout(
        () => {
          window.location.href =
            "/admin/login";
        },
        1800
      );
    } catch {
      setError(
        "Unable to change PIN."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">

        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            ← Back to Control Board
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b bg-slate-950 px-6 py-6 text-white sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
              Account Security
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Change PIN
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Change the PIN used to sign in to your
              DeeglobalGH administration account.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5 px-6 py-7 sm:px-8"
          >
            <div>
              <label
                htmlFor="currentPin"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Current PIN
              </label>

              <input
                id="currentPin"
                type="password"
                autoComplete="current-password"
                value={
                  currentPin
                }
                onChange={(
                  event
                ) =>
                  setCurrentPin(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPin"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                New PIN
              </label>

              <input
                id="newPin"
                type="password"
                autoComplete="new-password"
                value={
                  newPin
                }
                onChange={(
                  event
                ) =>
                  setNewPin(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use at least 6 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPin"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Confirm New PIN
              </label>

              <input
                id="confirmPin"
                type="password"
                autoComplete="new-password"
                value={
                  confirmPin
                }
                onChange={(
                  event
                ) =>
                  setConfirmPin(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              After your PIN changes successfully,
              your current session will be invalidated
              and you will need to sign in again with
              the new PIN.
            </div>

            <button
              type="submit"
              disabled={
                loading
              }
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Changing PIN..."
                : "Change PIN"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
