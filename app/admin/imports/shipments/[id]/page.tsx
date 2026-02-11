"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* =========================
   Types
========================= */
type ImportShipment = {
  id: string;
  reference: string;
  supplierName: string;
  sourceApp: string;
  sourceAppOther: string | null;
  freightForwarderName: string;
  shippingMode: "AIR" | "SEA";
  currency: string;
  exchangeRateSnapshot: string;
  supplierDeclaredCbm: string | null;
  status: string;
  createdAt: string;
};

type ImportCost = {
  id: string;
  costType: string;
  description: string | null;
  amountGhs: any; // Decimal-safe
  paymentMethod: string;
  isLocked: boolean;
};

/* =========================
   Helpers
========================= */
function formatAmount(value: any) {
  if (value === null || value === undefined) return "0.00";

  // Prisma Decimal may arrive as string, number, or object
  if (typeof value === "number") return value.toFixed(2);
  if (typeof value === "string") return Number(value).toFixed(2);

  if (typeof value === "object" && value.$numberDecimal) {
    return Number(value.$numberDecimal).toFixed(2);
  }

  return "0.00";
}

/* =========================
   Page
========================= */
export default function ImportShipmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [shipment, setShipment] = useState<ImportShipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const auth = await fetch("/api/admin/me");
      if (!auth.ok) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch("/api/admin/imports/shipments", {
        cache: "no-store",
      });
      const data = await res.json();

      const found = data.shipments?.find(
        (s: ImportShipment) => s.id === id
      );

      setShipment(found || null);
      setLoading(false);
    };

    load();
  }, [id, router]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p>Loading shipment…</p>
      </main>
    );
  }

  if (!shipment) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-red-600">Shipment not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">
          Shipment Details
        </h1>

        <button
          onClick={() => router.back()}
          className="rounded bg-gray-200 px-4 py-2 text-sm"
        >
          Back
        </button>
      </div>

      <div className="space-y-4 rounded-2xl border bg-white p-6 text-sm">
        <Detail label="Reference" value={shipment.reference} />
        <Detail label="Supplier" value={shipment.supplierName} />
        <Detail label="Source App" value={shipment.sourceApp} />
        {shipment.sourceAppOther && (
          <Detail
            label="Other Source"
            value={shipment.sourceAppOther}
          />
        )}
        <Detail
          label="Freight Forwarder"
          value={shipment.freightForwarderName}
        />
        <Detail label="Shipping Mode" value={shipment.shippingMode} />
        <Detail label="Currency" value={shipment.currency} />
        <Detail
          label="Exchange Rate"
          value={shipment.exchangeRateSnapshot}
        />
        <Detail
          label="Declared CBM"
          value={shipment.supplierDeclaredCbm ?? "—"}
        />
        <Detail label="Status" value={shipment.status} />
        <Detail
          label="Created"
          value={new Date(shipment.createdAt).toLocaleString()}
        />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">
          Import Costs
        </h2>
        <ImportCosts shipmentId={shipment.id} />
      </div>
    </main>
  );
}

/* =========================
   Import Costs
========================= */
function ImportCosts({ shipmentId }: { shipmentId: string }) {
  const [costs, setCosts] = useState<ImportCost[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    costType: "SUPPLIER",
    description: "",
    amountGhs: "",
    paymentMethod: "CASH",
  });

  const loadCosts = async () => {
    const res = await fetch(
      `/api/admin/imports/shipments/${shipmentId}/costs`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setCosts(data.costs || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCosts();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(
      `/api/admin/imports/shipments/${shipmentId}/costs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amountGhs: Number(form.amountGhs),
        }),
      }
    );

    setForm({
      costType: "SUPPLIER",
      description: "",
      amountGhs: "",
      paymentMethod: "CASH",
    });

    loadCosts();
  };

  const lockCost = async (id: string) => {
    const ok = window.confirm(
      "Lock this cost? This action cannot be undone."
    );
    if (!ok) return;

    await fetch(
      `/api/admin/imports/costs/${id}/lock`,
      { method: "POST" }
    );

    loadCosts();
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <p>Loading costs…</p>
      ) : costs.length === 0 ? (
        <p className="text-gray-600">No costs recorded.</p>
      ) : (
        <table className="w-full text-sm rounded border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Amount (GHS)</th>
              <th className="px-3 py-2 text-left">Payment</th>
              <th className="px-3 py-2 text-left">Control</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.costType}</td>
                <td className="px-3 py-2">
                  {c.description || "—"}
                </td>
                <td className="px-3 py-2 font-bold">
                  {formatAmount(c.amountGhs)}
                </td>
                <td className="px-3 py-2">
                  {c.paymentMethod}
                </td>
                <td className="px-3 py-2">
                  {c.isLocked ? (
                    <span className="text-xs font-semibold text-green-700">
                      🔒 Locked
                    </span>
                  ) : (
                    <button
                      onClick={() => lockCost(c.id)}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                    >
                      Lock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={submit} className="space-y-3">
        <h3 className="font-semibold">Add Cost</h3>

        <select
          className="w-full rounded border px-3 py-2"
          value={form.costType}
          onChange={(e) =>
            setForm({ ...form, costType: e.target.value })
          }
        >
          <option value="SUPPLIER">Supplier</option>
          <option value="INTERNATIONAL_SHIPPING">
            International Shipping
          </option>
          <option value="CLEARING_FEES">Clearing Fees</option>
          <option value="FREIGHT_FORWARDER_FEES">
            Freight Forwarder Fees
          </option>
          <option value="LOCAL_TRANSPORT">Local Transport</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          placeholder="Description (optional)"
          className="w-full rounded border px-3 py-2"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <input
          required
          type="number"
          step="0.01"
          placeholder="Amount (GHS)"
          className="w-full rounded border px-3 py-2"
          value={form.amountGhs}
          onChange={(e) =>
            setForm({ ...form, amountGhs: e.target.value })
          }
        />

        <select
          className="w-full rounded border px-3 py-2"
          value={form.paymentMethod}
          onChange={(e) =>
            setForm({ ...form, paymentMethod: e.target.value })
          }
        >
          <option value="CASH">Cash</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="MOMO">MoMo</option>
          <option value="ONLINE_CARD">Online Card</option>
          <option value="OTHER">Other</option>
        </select>

        <button className="rounded bg-blue-600 px-4 py-2 text-white">
          Add Cost
        </button>
      </form>
    </div>
  );
}

/* =========================
   Detail Row
========================= */
function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-semibold text-gray-600">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
