"use client";

export default function TestBankDepositPage() {
  async function createDeposit() {
    const response = await fetch("/api/finance/bank-deposits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bankName: "GCB Bank",
        amount: 1000,
        referenceNumber: "DEP-001",
        depositMethod: "Cash Deposit",
        notes: "Daily sales banking",
      }),
    });

    const data = await response.json();

    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bank Deposit API Test</h1>

      <button onClick={createDeposit}>
        Create Test Deposit
      </button>
    </div>
  );
}