"use client";

export default function TestExpensePage() {
  async function createExpense() {
    const response = await fetch("/api/finance/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expenseType: "Electricity",
        amount: 50,
        notes: "Test Expense",
      }),
    });

    const data = await response.json();

    console.log(data);

    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expense API Test</h1>

      <button onClick={createExpense}>
        Create Test Expense
      </button>
    </div>
  );
}