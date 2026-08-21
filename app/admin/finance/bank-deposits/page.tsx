"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type BankDeposit = {
  id: string;
  bankName: string;
  amount: string | number;
  referenceNumber: string | null;
  depositMethod: string;
  notes: string | null;
};

export default function BankDepositsPage() {
  const [bankName, setBankName] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [
    referenceNumber,
    setReferenceNumber,
  ] = useState("");

  const [
    depositMethod,
    setDepositMethod,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    deposits,
    setDeposits,
  ] = useState<BankDeposit[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const loadDeposits =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/finance/bank-deposits",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load bank deposits"
          );
        }

        setDeposits(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Bank deposit loading error:",
          error
        );

        setDeposits([]);
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadDeposits();
  }, [loadDeposits]);

  async function handleSubmit() {
    if (isSaving) {
      return;
    }

    const numericAmount =
      Number(amount);

    if (!bankName.trim()) {
      alert(
        "Bank name is required"
      );
      return;
    }

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      alert(
        "Amount must be greater than zero"
      );
      return;
    }

    if (!depositMethod.trim()) {
      alert(
        "Deposit method is required"
      );
      return;
    }

    setIsSaving(true);

    try {
      const response =
        await fetch(
          "/api/finance/bank-deposits",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              bankName:
                bankName.trim(),

              amount:
                numericAmount,

              referenceNumber:
                referenceNumber.trim(),

              depositMethod:
                depositMethod.trim(),

              notes:
                notes.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data?.error ||
            "Failed to save bank deposit"
        );
        return;
      }

      await loadDeposits();

      setBankName("");
      setAmount("");
      setReferenceNumber("");
      setDepositMethod("");
      setNotes("");

      alert(
        "Bank deposit saved successfully"
      );
    } catch (error) {
      console.error(
        "Bank deposit save error:",
        error
      );

      alert(
        "Failed to save bank deposit"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Bank Deposits
      </h1>

      <div className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Bank Name"
          value={bankName}
          onChange={(e) =>
            setBankName(
              e.target.value
            )
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="Reference Number"
          value={referenceNumber}
          onChange={(e) =>
            setReferenceNumber(
              e.target.value
            )
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="Deposit Method"
          value={depositMethod}
          onChange={(e) =>
            setDepositMethod(
              e.target.value
            )
          }
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
        />

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : "Save Deposit"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Deposits
        </h2>

        {isLoading ? (
          <p>
            Loading deposits...
          </p>
        ) : deposits.length ===
          0 ? (
          <p>
            No bank deposits recorded.
          </p>
        ) : (
          deposits.map(
            (deposit) => (
              <div
                key={deposit.id}
                className="border rounded p-3 mb-2"
              >
                <div>
                  <strong>
                    {
                      deposit.bankName
                    }
                  </strong>
                </div>

                <div>
                  Amount: GHS{" "}
                  {Number(
                    deposit.amount
                  ).toFixed(2)}
                </div>

                <div>
                  Method:{" "}
                  {
                    deposit.depositMethod
                  }
                </div>

                {deposit.referenceNumber ? (
                  <div>
                    Ref:{" "}
                    {
                      deposit.referenceNumber
                    }
                  </div>
                ) : null}

                {deposit.notes ? (
                  <div>
                    {
                      deposit.notes
                    }
                  </div>
                ) : null}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
