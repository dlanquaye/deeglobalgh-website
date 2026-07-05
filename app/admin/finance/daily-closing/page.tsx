"use client";

import { useEffect, useState } from "react";

export default function DailyClosingPage() {
  const [businessDate, setBusinessDate] = useState("");
  const [openingFloat, setOpeningFloat] = useState("");
  const [expectedCash, setExpectedCash] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [varianceReason, setVarianceReason] = useState("");

  

  const [closings, setClosings] = useState([]);

  async function loadClosings() {
    const response = await fetch("/api/finance/daily-closing");

    const data = await response.json();

    console.log(data);
    
    setClosings(data);
  }

  useEffect(() => {
    loadClosings();
  }, []);

  
  async function handleSubmit() {

    

    const response = await fetch("/api/finance/daily-closing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessDate,
        openingFloat: Number(openingFloat),
        
        actualCash: Number(actualCash),
        varianceReason,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
  alert(result.error || "Failed to save daily closing");
  return;
}
    setExpectedCash(result.expectedCash?.toString() ?? "");
    alert(
  `Daily Closing Saved

Expected Cash: GHS ${result.expectedCash}

Variance: GHS ${result.variance}`
);

    await loadClosings();

    setBusinessDate("");
    setOpeningFloat("");
    setExpectedCash("");
    setActualCash("");
    setVarianceReason("");

    alert("Daily closing saved successfully");
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Daily Closing
      </h1>

      <div className="space-y-4">
        <input
          type="date"
          className="border p-2 w-full"
          value={businessDate}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setBusinessDate(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Opening Float"
          value={openingFloat}
          onChange={(e) => setOpeningFloat(e.target.value)}
        />

        <input
  type="number"
  className="border p-2 w-full bg-gray-100"
  placeholder="Expected Cash"
  value={expectedCash}
  readOnly
/>

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Actual Cash"
          value={actualCash}
          onChange={(e) => setActualCash(e.target.value)}
        />

<div className="font-semibold">
  Variance: Will be calculated after saving
</div>

        <textarea
          className="border p-2 w-full"
          placeholder="Variance Reason"
          value={varianceReason}
          onChange={(e) => setVarianceReason(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Daily Closing
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Daily Closings
        </h2>

        {closings.map((closing: any) => (
          <div
            key={closing.id}
            className="border rounded p-3 mb-2"
          >
            <div>
  Date:{" "}
  {new Date(closing.businessDate).toLocaleDateString("en-GB")}
</div>

<div>
  Opening Float: GHS {closing.openingFloat}
</div>

            <div>
              Expected: GHS {closing.expectedCash}
            </div>

            <div>
              Actual: GHS {closing.actualCash}
            </div>

            <div>
              Variance: GHS {closing.variance}
            </div>

            <div>
              {closing.varianceReason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}