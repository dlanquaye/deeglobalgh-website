"use client";

import { useEffect, useState } from "react";

type ImportShipment = {
  id: string;
  reference: string;
  supplierName: string;
  shippingMode: "AIR" | "SEA";
  currency: string;
  status:
    | "DRAFT"
    | "PAID"
    | "IN_TRANSIT"
    | "ARRIVED_GH"
    | "COMPLETED";
  createdAt: string;
};

export default function AdminImportShipmentsPage() {
  const [shipments, setShipments] = useState<ImportShipment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadShipments = async () => {
    const res = await fetch("/api/admin/imports/shipments", {
      cache: "no-store",
    });
    const data = await res.json();
    setShipments(data.shipments || []);
    setLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/admin/me");
      if (!res.ok) {
        window.location.href = "/admin/login";
        return;
      }
      loadShipments();
    };

    checkAuth();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">
          Import Shipments (Admin)
        </h1>

        {/* CREATE BUTTON */}
        <a
          href="/admin/imports/shipments/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Create Shipment
        </a>
      </div>

      {loading ? (
        <p>Loading shipments…</p>
      ) : shipments.length === 0 ? (
        <p className="text-gray-600">No import shipments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-left">Shipping</th>
                <th className="px-4 py-3 text-left">Currency</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {shipments.map((s) => (
                <tr
  key={s.id}
  className="border-t cursor-pointer hover:bg-gray-50"
  onClick={() =>
    (window.location.href = `/admin/imports/shipments/${s.id}`)
  }
>

                  <td className="px-4 py-3 font-mono">
                    {s.reference}
                  </td>
                  <td className="px-4 py-3">
                    {s.supplierName}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {s.shippingMode}
                  </td>
                  <td className="px-4 py-3">
                    {s.currency}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {s.status}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
