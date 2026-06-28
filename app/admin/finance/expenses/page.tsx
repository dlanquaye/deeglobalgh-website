"use client";

import { useEffect } from "react";
import { useState } from "react";

export default function ExpensesPage() {
  const [expenseType, setExpenseType] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [expenses, setExpenses] = useState([]);

  async function loadExpenses() {
    const response = await fetch("/api/finance/expenses");

    const data = await response.json();

    setExpenses(data);
  }

  useEffect(() => {
  

  loadExpenses();
}, []);


  async function handleSubmit() {
    const response = await fetch("/api/finance/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expenseType,
        amount: Number(amount),
        notes,
      }),
    });

    const data = await response.json();

await loadExpenses();

setExpenseType("");
setAmount("");
setNotes("");

alert("Expense saved successfully");

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
          onChange={(e) => setExpenseType(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Expense
        </button>

        <div className="mt-8">
  <h2 className="text-xl font-semibold mb-4">
    Expenses
  </h2>

  {expenses.map((expense: any) => (
    <div
      key={expense.id}
      className="border rounded p-3 mb-2"
    >
      <div>
        <strong>{expense.expenseType}</strong>
      </div>

      <div>
        Amount: GHS {expense.amount}
      </div>

      <div>
        {expense.notes}
      </div>
    </div>
  ))}
</div>

      </div>
    </div>
  );
}