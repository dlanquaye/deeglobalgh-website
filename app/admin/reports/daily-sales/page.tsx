"use client";

import { useEffect, useState } from "react";
import { formatPaymentMethod } from "@/lib/payment-method";

const BRANCH_ID = "branch_main";

export default function DailySalesReportPage() {
    const [reportDate, setReportDate] = useState(
  new Date().toISOString().split("T")[0]
);

const [sales, setSales] = useState([]);
const [loading, setLoading] = useState(false);
const [totalSales, setTotalSales] = useState(0);
const [cashSales, setCashSales] = useState(0);
const [mobileMoneySales, setMobileMoneySales] = useState(0);
const [bankTransferSales, setBankTransferSales] = useState(0);
const [onlineCardSales, setOnlineCardSales] = useState(0);

async function loadReport() {
  setLoading(true);

  const response = await fetch(
  `/api/reports/daily-sales?date=${reportDate}`
);

const result = await response.json();
setSales(result.sales ?? []);
setTotalSales(result.totalSales ?? 0);
setCashSales(result.cashSales ?? 0);
setMobileMoneySales(result.mobileMoneySales ?? 0);
setBankTransferSales(result.bankTransferSales ?? 0);
setOnlineCardSales(result.onlineCardSales ?? 0);

if (!response.ok) {
  alert(result.error || "Failed to load report");
}

  setLoading(false);
}

useEffect(() => {
  loadReport();
}, [reportDate]);

  return (
    <div className="p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">
        Daily Sales Report
      </h1>

      <div className="mb-6">
  <input
    type="date"
    className="border p-2 rounded"
    value={reportDate}
    onChange={(e) => setReportDate(e.target.value)}
  />
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">

  <div className="border rounded-lg p-4 bg-white">
    <div className="text-sm text-gray-500">Orders</div>
    <div className="text-3xl font-bold">
      {sales.length}
    </div>
  </div>

  <div className="border rounded-lg p-4 bg-white">
    <div className="text-sm text-gray-500">Total Sales</div>
    <div className="text-3xl font-bold">
      GHS {Number(totalSales).toFixed(2)}
    </div>
  </div>

  <div className="border rounded-lg p-4 bg-white">
    <div className="text-sm text-gray-500">Cash Sales</div>
    <div className="text-3xl font-bold">
      GHS {Number(cashSales).toFixed(2)}
    </div>
  </div>

  <div className="border rounded-lg p-4 bg-white">
    <div className="text-sm text-gray-500">Mobile Money</div>
    <div className="text-3xl font-bold">
      GHS {Number(mobileMoneySales).toFixed(2)}
    </div>
  </div>

  <div className="border rounded-lg p-4 bg-white">
    <div className="text-sm text-gray-500">Bank Transfer</div>
    <div className="text-3xl font-bold">
      GHS {Number(bankTransferSales).toFixed(2)}
    </div>
  </div>

  <div className="border rounded-lg p-4 bg-white">
    <div className="text-sm text-gray-500">Online Card</div>
    <div className="text-3xl font-bold">
      GHS {Number(onlineCardSales).toFixed(2)}
    </div>
  </div>

</div>

<div className="bg-white rounded-lg border">
  <table className="w-full">
    <thead>
      <tr className="border-b">
        <th className="text-left p-3">Order No.</th>
        <th className="text-left p-3">Customer</th>
        <th className="text-left p-3">Payment Method</th>
        <th className="text-right p-3">Amount</th>
      </tr>
    </thead>

    <tbody>

        {sales.map((sale: any) => (
  <tr key={sale.id} className="border-b">
    <td className="p-3">{sale.orderId}</td>

    <td className="p-3">
  {sale.customerName || "Walk-in Customer"}
</td>

    <td className="p-3">
  {formatPaymentMethod(sale.paymentMethod)}
</td>

    <td className="p-3 text-right">
      GHS {Number(sale.amount).toFixed(2)}
    </td>
  </tr>
))}

    </tbody>
  </table>
</div>

      <div className="bg-white rounded-lg border p-6">
        Report content will appear here.
      </div>

      
    </div>
    
  );

}