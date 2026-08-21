"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type DailyClosing = {
  id: string;
  businessDate: string;
  openingFloat:
    | string
    | number;
  expectedCash:
    | string
    | number;
  actualCash:
    | string
    | number;
  variance:
    | string
    | number;
  varianceReason:
    | string
    | null;
};

type DailyClosingResult = DailyClosing & {
  cashSales?: number;
  standardCashSales?: number;
  splitCashSales?: number;
  expenseTotal?: number;
  purchaseTotal?: number;
  bankDepositTotal?: number;
};

function formatMoney(
  value:
    | string
    | number
    | null
    | undefined
) {
  const amount =
    Number(value ?? 0);

  return Number.isFinite(amount)
    ? amount.toFixed(2)
    : "0.00";
}

export default function DailyClosingPage() {
  const [
    businessDate,
    setBusinessDate,
  ] = useState("");

  const [
    openingFloat,
    setOpeningFloat,
  ] = useState("");

  const [
    actualCash,
    setActualCash,
  ] = useState("");

  const [
    varianceReason,
    setVarianceReason,
  ] = useState("");

  const [
    closings,
    setClosings,
  ] = useState<
    DailyClosing[]
  >([]);

  const [
    latestResult,
    setLatestResult,
  ] = useState<
    DailyClosingResult | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const loadClosings =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const response =
            await fetch(
              "/api/finance/daily-closing",
              {
                cache:
                  "no-store",
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.error ||
                "Failed to fetch daily closings"
            );
          }

          setClosings(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch daily closings";

          alert(message);
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    void loadClosings();
  }, [loadClosings]);

  async function handleSubmit() {
    if (saving) {
      return;
    }

    if (!businessDate) {
      alert(
        "Business date is required"
      );
      return;
    }

    const opening =
      Number(openingFloat);

    if (
      !Number.isFinite(
        opening
      ) ||
      opening < 0
    ) {
      alert(
        "Opening Float must be zero or greater"
      );
      return;
    }

    const actual =
      Number(actualCash);

    if (
      !Number.isFinite(
        actual
      ) ||
      actual < 0
    ) {
      alert(
        "Actual Cash must be zero or greater"
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          "/api/finance/daily-closing",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                businessDate,

                openingFloat:
                  openingFloat.trim(),

                actualCash:
                  actualCash.trim(),

                varianceReason:
                  varianceReason.trim(),
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to save daily closing"
        );
      }

      setLatestResult(
        result
      );

      await loadClosings();

      setBusinessDate("");
      setOpeningFloat("");
      setActualCash("");
      setVarianceReason("");

      alert(
        `Daily Closing Saved

Expected Cash: GHS ${formatMoney(
          result.expectedCash
        )}

Variance: GHS ${formatMoney(
          result.variance
        )}`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save daily closing";

      alert(message);
    } finally {
      setSaving(false);
    }
  }

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        Daily Closing
      </h1>

      <div className="space-y-4">
        <input
          type="date"
          className="border p-2 w-full"
          value={businessDate}
          max={today}
          onChange={(e) =>
            setBusinessDate(
              e.target.value
            )
          }
          disabled={saving}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          className="border p-2 w-full"
          placeholder="Opening Float"
          value={openingFloat}
          onChange={(e) =>
            setOpeningFloat(
              e.target.value
            )
          }
          disabled={saving}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          className="border p-2 w-full"
          placeholder="Actual Cash"
          value={actualCash}
          onChange={(e) =>
            setActualCash(
              e.target.value
            )
          }
          disabled={saving}
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Variance Reason"
          value={varianceReason}
          onChange={(e) =>
            setVarianceReason(
              e.target.value
            )
          }
          disabled={saving}
        />

        <button
          type="button"
          onClick={
            handleSubmit
          }
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Daily Closing"}
        </button>
      </div>

      {latestResult && (
        <div className="mt-8 border rounded p-4">
          <h2 className="text-xl font-semibold mb-3">
            Latest Reconciliation
          </h2>

          <div>
            Cash Sales: GHS{" "}
            {formatMoney(
              latestResult.cashSales
            )}
          </div>

          <div>
            Standard Cash Sales:
            GHS{" "}
            {formatMoney(
              latestResult
                .standardCashSales
            )}
          </div>

          <div>
            Split Cash Sales:
            GHS{" "}
            {formatMoney(
              latestResult
                .splitCashSales
            )}
          </div>

          <div>
            Expenses: GHS{" "}
            {formatMoney(
              latestResult
                .expenseTotal
            )}
          </div>

          <div>
            Purchases Recorded:
            GHS{" "}
            {formatMoney(
              latestResult
                .purchaseTotal
            )}
          </div>

          <div>
            Bank Deposits: GHS{" "}
            {formatMoney(
              latestResult
                .bankDepositTotal
            )}
          </div>

          <div className="font-semibold mt-2">
            Expected Cash: GHS{" "}
            {formatMoney(
              latestResult
                .expectedCash
            )}
          </div>

          <div className="font-semibold">
            Actual Cash: GHS{" "}
            {formatMoney(
              latestResult
                .actualCash
            )}
          </div>

          <div className="font-semibold">
            Variance: GHS{" "}
            {formatMoney(
              latestResult
                .variance
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Daily Closings
        </h2>

        {loading ? (
          <div>
            Loading daily
            closings...
          </div>
        ) : closings.length ===
          0 ? (
          <div>
            No daily closings
            found.
          </div>
        ) : (
          closings.map(
            (closing) => (
              <div
                key={
                  closing.id
                }
                className="border rounded p-3 mb-2"
              >
                <div>
                  Date:{" "}
                  {new Date(
                    closing.businessDate
                  ).toLocaleDateString(
                    "en-GB"
                  )}
                </div>

                <div>
                  Opening Float:
                  GHS{" "}
                  {formatMoney(
                    closing.openingFloat
                  )}
                </div>

                <div>
                  Expected: GHS{" "}
                  {formatMoney(
                    closing.expectedCash
                  )}
                </div>

                <div>
                  Actual: GHS{" "}
                  {formatMoney(
                    closing.actualCash
                  )}
                </div>

                <div>
                  Variance: GHS{" "}
                  {formatMoney(
                    closing.variance
                  )}
                </div>

                {closing.varianceReason && (
                  <div>
                    Reason:{" "}
                    {
                      closing.varianceReason
                    }
                  </div>
                )}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
