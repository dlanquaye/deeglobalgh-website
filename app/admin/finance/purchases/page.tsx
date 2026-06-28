"use client";

import { useEffect, useState } from "react";

export default function PurchasesPage() {
  const [supplierName, setSupplierName] = useState("");
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [purchases, setPurchases] = useState([]);

  async function loadPurchases() {
    const response = await fetch("/api/finance/purchases");

    const data = await response.json();

    setPurchases(data);
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  async function handleSubmit() {
    const response = await fetch("/api/finance/purchases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supplierName,
        amount: Number(amount),
        referenceNumber,
        notes,
      }),
    });

    await response.json();

    await loadPurchases();

    setSupplierName("");
    setAmount("");
    setReferenceNumber("");
    setNotes("");

    alert("Purchase saved successfully");
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
          onChange={(e) => setSupplierName(e.target.value)}
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
          Save Purchase
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Purchases
        </h2>

        {purchases.map((purchase: any) => (
          <div
            key={purchase.id}
            className="border rounded p-3 mb-2"
          >
            <div>
              <strong>{purchase.supplierName}</strong>
            </div>

            <div>
              Amount: GHS {purchase.amount}
            </div>

            <div>
              Ref: {purchase.referenceNumber}
            </div>

            <div>
              {purchase.notes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}