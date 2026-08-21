"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type Expense = {
  id: string;
  expenseType: string;
  amount: string | number;
  notes: string;
};

type ExpensesResponse = {
  expenses: Expense[];
  expenseTotals?: {
    _sum?: {
      amount?: string | number | null;
    };
  };
  error?: string;
};

export default function ExpensesPage() {
  const [expenseType, setExpenseType] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [totalExpenses, setTotalExpenses] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const loadExpenses =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/finance/expenses",
            {
              cache: "no-store",
            }
          );

        const data =
          (await response.json()) as
            ExpensesResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load expenses"
          );
        }

        setExpenses(
          Array.isArray(data.expenses)
            ? data.expenses
            : []
        );

        setTotalExpenses(
          Number(
            data.expenseTotals?._sum
              ?.amount ?? 0
          )
        );
      } catch (error) {
        console.error(
          "Expense loading error:",
          error
        );

        setExpenses([]);
        setTotalExpenses(0);
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  async function handleSubmit() {
    if (isSaving) {
      return;
    }

    const numericAmount =
      Number(amount);

    if (!expenseType.trim()) {
      alert(
        "Expense type is required"
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

    if (!notes.trim()) {
      alert("Notes are required");
      return;
    }

    setIsSaving(true);

    try {
      const response =
        await fetch(
          "/api/finance/expenses",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              expenseType:
                expenseType.trim(),

              amount:
                numericAmount,

              notes:
                notes.trim(),
            }),
          }
        );

      const data =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to save expense"
        );
        return;
      }

      await loadExpenses();

      setExpenseType("");
      setAmount("");
      setNotes("");

      alert(
        "Expense saved successfully"
      );
    } catch (error) {
      console.error(
        "Expense save error:",
        error
      );

      alert(
        "Failed to save expense"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Expense Management
      </h1>

      <div className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Expense Type"
          value={expenseType}
          onChange={(e) =>
            setExpenseType(
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
          onClick={
            handleSubmit
          }
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : "Save Expense"}
        </button>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">
            Expenses
          </h2>

          <p className="mb-4 font-medium">
            Total Expenses: GHS{" "}
            {totalExpenses.toFixed(
              2
            )}
          </p>

          {isLoading ? (
            <p>
              Loading expenses...
            </p>
          ) : expenses.length ===
            0 ? (
            <p>
              No expenses recorded.
            </p>
          ) : (
            expenses.map(
              (expense) => (
                <div
                  key={
                    expense.id
                  }
                  className="border rounded p-3 mb-2"
                >
                  <div>
                    <strong>
                      {
                        expense.expenseType
                      }
                    </strong>
                  </div>

                  <div>
                    Amount: GHS{" "}
                    {Number(
                      expense.amount
                    ).toFixed(
                      2
                    )}
                  </div>

                  <div>
                    {
                      expense.notes
                    }
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
