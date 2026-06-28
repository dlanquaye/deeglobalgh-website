"use client";

export default function TestDailyClosingPage() {
  async function createClosing() {
    const response = await fetch("/api/finance/daily-closing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessDate: new Date().toISOString(),
        openingFloat: 200,
        expectedCash: 3500,
        actualCash: 3450,
        varianceReason: "Test variance",
      }),
    });

    const data = await response.json();

    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Daily Closing API Test</h1>

      <button onClick={createClosing}>
        Create Daily Closing
      </button>
    </div>
  );
}