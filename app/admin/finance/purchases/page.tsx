"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type Purchase = {
  id: string;
  supplierName: string;
  amount: string | number;
  referenceNumber: string | null;
  notes: string | null;
};

export default function PurchasesPage() {
  const [
    supplierName,
    setSupplierName,
  ] = useState("");

  const [amount, setAmount] =
    useState("");

  const [
    referenceNumber,
    setReferenceNumber,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    purchases,
    setPurchases,
  ] = useState<Purchase[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const loadPurchases =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/finance/purchases",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load purchases"
          );
        }

        setPurchases(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Purchase loading error:",
          error
        );

        setPurchases([]);
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadPurchases();
  }, [loadPurchases]);

  async function handleSubmit() {
    if (isSaving) {
      return;
    }

    const numericAmount =
      Number(amount);

    if (!supplierName.trim()) {
      alert(
        "Supplier name is required"
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

    setIsSaving(true);

    try {
      const response =
        await fetch(
          "/api/finance/purchases",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              supplierName:
                supplierName.trim(),

              amount:
                numericAmount,

              referenceNumber:
                referenceNumber.trim(),

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
            "Failed to save purchase"
        );
        return;
      }

      await loadPurchases();

      setSupplierName("");
      setAmount("");
      setReferenceNumber("");
      setNotes("");

      alert(
        "Purchase saved successfully"
      );
    } catch (error) {
      console.error(
        "Purchase save error:",
        error
      );

      alert(
        "Failed to save purchase"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Purchase Management
      </h1>

      <div className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Supplier Name"
          value={supplierName}
          onChange={(e) =>
            setSupplierName(
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
            : "Save Purchase"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Purchases
        </h2>

        {isLoading ? (
          <p>
            Loading purchases...
          </p>
        ) : purchases.length ===
          0 ? (
          <p>
            No purchases recorded.
          </p>
        ) : (
          purchases.map(
            (purchase) => (
              <div
                key={purchase.id}
                className="border rounded p-3 mb-2"
              >
                <div>
                  <strong>
                    {
                      purchase.supplierName
                    }
                  </strong>
                </div>

                <div>
                  Amount: GHS{" "}
                  {Number(
                    purchase.amount
                  ).toFixed(2)}
                </div>

                {purchase.referenceNumber ? (
                  <div>
                    Ref:{" "}
                    {
                      purchase.referenceNumber
                    }
                  </div>
                ) : null}

                {purchase.notes ? (
                  <div>
                    {
                      purchase.notes
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
