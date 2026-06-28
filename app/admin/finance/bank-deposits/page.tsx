"use client";

import { useEffect, useState } from "react";

export default function BankDepositsPage() {
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [depositMethod, setDepositMethod] = useState("");
  const [notes, setNotes] = useState("");

  const [deposits, setDeposits] = useState([]);

  async function loadDeposits() {
    const response = await fetch("/api/finance/bank-deposits");

    const data = await response.json();

    setDeposits(data);
  }

  useEffect(() => {
    loadDeposits();
  }, []);

  async function handleSubmit() {
    const response = await fetch("/api/finance/bank-deposits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bankName,
        amount: Number(amount),
        referenceNumber,
        depositMethod,
        notes,
      }),
    });

    await response.json();

    await loadDeposits();

    setBankName("");
    setAmount("");
    setReferenceNumber("");
    setDepositMethod("");
    setNotes("");

    alert("Bank deposit saved successfully");
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
          onChange={(e) => setBankName(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Reference Number"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Deposit Method"
          value={depositMethod}
          onChange={(e) => setDepositMethod(e.target.value)}
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
          Save Deposit
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Deposits
        </h2>

        {deposits.map((deposit: any) => (
          <div
            key={deposit.id}
            className="border rounded p-3 mb-2"
          >
            <div>
              <strong>{deposit.bankName}</strong>
            </div>

            <div>
              Amount: GHS {deposit.amount}
            </div>

            <div>
              Method: {deposit.depositMethod}
            </div>

            <div>
              Ref: {deposit.referenceNumber}
            </div>

            <div>
              {deposit.notes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}