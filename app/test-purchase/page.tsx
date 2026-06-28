"use client";

export default function TestPurchasePage() {
  async function createPurchase() {
    const response = await fetch("/api/finance/purchases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supplierName: "Wise Ant Publishers",
        amount: 500,
        referenceNumber: "INV-001",
        notes: "Initial stock purchase",
      }),
    });

    const data = await response.json();

    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Purchase API Test</h1>

      <button onClick={createPurchase}>
        Create Test Purchase
      </button>
    </div>
  );
}