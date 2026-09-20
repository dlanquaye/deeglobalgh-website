"use client";

import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

type SecurityAlertActionsProps = {
  eventId?: string;
  markAll?: boolean;
};

export default function SecurityAlertActions({
  eventId,
  markAll = false,
}: SecurityAlertActionsProps) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  async function handleMarkRead() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/admin/security/alerts",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              markAll
                ? {
                    markAll:
                      true,
                  }
                : {
                    eventId,
                  }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update alert."
        );

        return;
      }

      router.refresh();
    } catch {
      setError(
        "Unable to update alert."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={
          handleMarkRead
        }
        disabled={
          loading
        }
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Updating..."
          : markAll
            ? "Mark All Reviewed"
            : "Mark Reviewed"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
