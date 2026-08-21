"use client";

import { useEffect, useState } from "react";

type DbOrder = {
  id: string;
  orderId: string;
  reference: string | null;
  phone: string;
  email: string;
  amount: number;
  deliveryFee: number | null;
  adminNotes: string | null;
  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "DELIVERING"
    | "COMPLETED"
    | "PROCESSING"
    | "DELIVERED";
  smsSent: boolean;
  createdAt: string;
  orderItems: {
  quantity: number;
  product?: {
    name: string;
  };
}[];
};

export default function AdminDbOrdersClient() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  
  const [filter, setFilter] = useState<
    "ALL" | "PAID" | "PROCESSING" | "DELIVERED"
  >("ALL");
  const [dateFilter, setDateFilter] = useState<
    "ALL" | "TODAY" | "WEEK" | "MONTH"
  >("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

const [creatingPaymentLinkOrderId, setCreatingPaymentLinkOrderId] =
  useState<string | null>(null);

const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/db-orders", {
      cache: "no-store",
    });
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  const loadProducts = async () => {
  const res = await fetch("/api/admin/products", {
    cache: "no-store",
  });
  const data = await res.json();
  setProducts(data.products || []);
};

  useEffect(() => {
  loadOrders();
  loadProducts();
}, []);

  // SUMMARY
  const totalOrders = orders.length;

  const topProductsToday = (() => {
  const map = new Map<string, number>();

  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const today = new Date();

    const isToday =
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();

    const isValidStatus = ["PAID", "DELIVERING", "COMPLETED"].includes(
      o.paymentStatus
    );

    if (!isToday || !isValidStatus) return;

    o.orderItems.forEach((item) => {
      const name = item.product?.name || "Unknown Product";
      map.set(name, (map.get(name) || 0) + item.quantity);
    });
  });

  return Array.from(map.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
})();

  const fastMovingProducts = (() => {
  const map = new Map<string, number>();

  orders.forEach((o) => {
    const isValidStatus = ["PAID", "DELIVERING", "COMPLETED"].includes(
      o.paymentStatus
    );

    if (!isValidStatus) return;

    o.orderItems.forEach((item) => {
      const name = item.product?.name || "Unknown Product";
      map.set(name, (map.get(name) || 0) + item.quantity);
    });
  });

  return Array.from(map.entries())
    .map(([name, qty]) => {
      let demandLevel = "LOW";

      if (qty >= 5) demandLevel = "HIGH";
      else if (qty >= 3) demandLevel = "MEDIUM";

      return { name, qty, demandLevel };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);
})();

const allProductsMap = (() => {
  const map = new Map<string, number>();

  orders.forEach((o) => {
    const isValidStatus = ["PAID", "DELIVERING", "COMPLETED"].includes(
      o.paymentStatus
    );

    if (!isValidStatus) return;

    o.orderItems.forEach((item) => {
      const name = item.product?.name || "Unknown Product";
      map.set(name, (map.get(name) || 0) + item.quantity);
    });
  });

  return Array.from(map.entries()).map(([name, qty]) => ({
    name,
    qty,
  }));
})();
  
const availableCapital = 2500;



const smartLowStockProducts = products

  .map((p) => {
    const demand =
      allProductsMap.find((x) => x.name === p.name)?.qty || 0;

    let demandLevel = "LOW";

    if (demand >= 5) demandLevel = "HIGH";
    else if (demand >= 3) demandLevel = "MEDIUM";

    const isLowStock = p.stockQty <= p.lowStockThreshold;

    let restockQty = 0;

    if (demandLevel === "HIGH") restockQty = 10;
    else if (demandLevel === "MEDIUM") restockQty = 5;
    else restockQty = 3;

    const unitCost = p.costPrice || 0;

const restockCost = unitCost * restockQty;

return {
  name: p.name,
  stockQty: p.stockQty,
  demand,
  demandLevel,
  isLowStock,
  restockQty,
  restockCost,
    unitCost,
    supplier: p.supplier || "unknown", // 👈 ADD THIS

};
  })
  .filter((p) => p.isLowStock)
  .sort((a, b) => a.stockQty - b.stockQty); // lowest first

  const prioritizedRestock = (() => {
  let remaining = availableCapital;

  

  return smartLowStockProducts
    // Sort HIGH → MEDIUM → LOW
    .sort((a, b) => {
      const order: any = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.demandLevel] - order[b.demandLevel];
    })
    .map((p) => {
  if (p.unitCost === 0) return null;

  const maxAffordableQty = Math.floor(remaining / p.unitCost);

  if (maxAffordableQty <= 0) return null;

  const finalQty = Math.min(maxAffordableQty, p.restockQty);
  const finalCost = finalQty * p.unitCost;

  remaining -= finalCost;

  return {
  name: p.name,
  stockQty: p.stockQty,
  demand: p.demand,
  demandLevel: p.demandLevel,
  isLowStock: p.isLowStock,
  unitCost: p.unitCost,
  supplier: p.supplier || "unknown", // 👈 FORCE KEEP
  restockQty: finalQty,
  restockCost: finalCost,
};
})

.filter((p): p is NonNullable<typeof p> => p !== null);})();

console.log("RESTOCK ITEMS:", prioritizedRestock);

// ✅ GROUP RESTOCK BY SUPPLIER
const restockBySupplier: Record<string, typeof prioritizedRestock> = {};

prioritizedRestock.forEach((item) => {
  const supplier = item.supplier || "unknown";

  if (!restockBySupplier[supplier]) {
    restockBySupplier[supplier] = [];
  }

  restockBySupplier[supplier].push(item);
});

  const lowStockProductsFromDB = products
  .filter((p) => p.stockQty <= p.lowStockThreshold)
  .sort((a, b) => a.stockQty - b.stockQty);

  const criticalStockProducts = products
  .filter((p) => p.stockQty <= 1)
  .sort((a, b) => a.stockQty - b.stockQty);

const lowStockProducts = fastMovingProducts.filter(
  (p) => p.qty <= 2
);


  const now = new Date();

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

const todayRevenue = orders
  .filter((o) => {
    const d = new Date(o.createdAt);

    const today = new Date();

    return (
      ["PAID", "DELIVERING", "COMPLETED"].includes(o.paymentStatus) &&
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  })
  .reduce(
    (sum, o) => sum + o.amount,
    0
  );

   const todayItemsSold = orders
  .filter((o) => {
    const d = new Date(o.createdAt);
    const today = new Date();

    return (
      ["PAID", "DELIVERING", "COMPLETED"].includes(o.paymentStatus) &&
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  })
  .reduce(
    (sum, o) =>
      sum +
      o.orderItems.reduce((itemSum, i) => itemSum + i.quantity, 0),
    0
  );

  const weekItemsSold = orders
  .filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return (
      ["PAID", "DELIVERING", "COMPLETED"].includes(o.paymentStatus) &&
      d >= startOfWeek &&
      d <= now
    );
  })
  .reduce(
    (sum, o) =>
      sum +
      o.orderItems.reduce((itemSum, i) => itemSum + i.quantity, 0),
    0
  );

  const monthItemsSold = orders
  .filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();

  

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    

    return (
      ["PAID", "DELIVERING", "COMPLETED"].includes(o.paymentStatus) &&
      d >= startOfMonth &&
      d <= now
    );
  })
  .reduce(
    (sum, o) =>
      sum +
      o.orderItems.reduce((itemSum, i) => itemSum + i.quantity, 0),
    0
  );


const weekRevenue = orders
  .filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();

    // Start of week (Sunday → Saturday)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return (
      ["PAID", "DELIVERING", "COMPLETED"].includes(o.paymentStatus) &&
      d >= startOfWeek &&
      d <= now
    );
  })
  .reduce((sum, o) => sum + o.amount, 0);

const monthRevenue = orders
  .filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    
  

    return (
      ["PAID", "DELIVERING", "COMPLETED"].includes(o.paymentStatus) &&
      d >= startOfMonth &&
      d <= now
    );
  })
  .reduce((sum, o) => sum + o.amount, 0);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.amount, 0);

    const paidOrders = orders.filter(
  (o) => o.paymentStatus === "PAID"
).length;

const averageOrderValue =
  paidOrders > 0 ? totalRevenue / paidOrders : 0;
  

  const processingOrders = orders.filter((o) => {
    const status =
      o.paymentStatus === "DELIVERING"
        ? "PROCESSING"
        : o.paymentStatus;
    return status === "PROCESSING";
  }).length;

  const deliveredOrders = orders.filter((o) => {
    const status =
      o.paymentStatus === "COMPLETED"
        ? "DELIVERED"
        : o.paymentStatus;
    return status === "DELIVERED";
  }).length;
    const getWhatsAppMessage = (order: DbOrder, status: string) => {
  const itemsList =
  order.orderItems && order.orderItems.length > 0
    ? order.orderItems
        .map((item, index) => {
          const name = item.product?.name ?? "Item";
          return `${index + 1}. ${name} x${item.quantity}`;
        })
        .join("\n")
    : "No items found";

  if (status === "PROCESSING") {
    return `Hello, your order (${order.orderId}) is now being prepared.

🛒 Items:
${itemsList}

Total: GHS ${order.amount.toFixed(2)}

Our team will contact you shortly for delivery.

Thank you for choosing DeeglobalGh.`;
  }

  if (status === "DELIVERED") {
    return `Hello, your order (${order.orderId}) has been successfully delivered.

🛒 Items:
${itemsList}

Total: GHS ${order.amount.toFixed(2)}

Please check your items and report any issues within 24 hours so we can assist you quickly.

Thank you for choosing DeeglobalGh.`;
  }

  return "";
};

  const updateStatus = async (
  id: string,
  status: DbOrder["paymentStatus"]
) => {
  setUpdatingOrderId(id);

  try {
    let backendStatus = status;

    if (status === "PROCESSING") backendStatus = "DELIVERING";
    if (status === "DELIVERED") backendStatus = "COMPLETED";

    const res = await fetch("/api/admin/update-order-status", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: backendStatus }),
    });

    const result = await res.json();

    if (!res.ok) {
  console.error("Status update failed:", result);
  return;
}

    const order = orders.find((o) => o.id === id);

    if (order) {
      const message = getWhatsAppMessage(order, status);

      if (message) {
        const encoded = encodeURIComponent(message);
        const phone = order.phone.replace(/^0/, "233");

        window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
      }
    }

    await loadOrders();
  } catch (error) {
    console.error("Error updating status:", error);
  }

  setUpdatingOrderId(null);
};

  const saveMeta = async (order: DbOrder) => {
  setSavingOrderId(order.orderId);

  try {
    const res = await fetch("/api/admin/update-order-meta", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: order.orderId,
        deliveryFee: order.deliveryFee,
        adminNotes: order.adminNotes,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(
        result?.error ||
          "Unable to save delivery information."
      );
      return false;
    }

    await loadOrders();

    return true;
  } catch (error) {
    console.error(
      "Error saving order meta:",
      error
    );

    alert(
      "Unable to save delivery information."
    );

    return false;
  } finally {
    setSavingOrderId(null);
  }
};

const sendPaymentLink = async (
  order: DbOrder
) => {
  if (
    order.deliveryFee === null ||
    order.deliveryFee === undefined ||
    !Number.isFinite(order.deliveryFee) ||
    order.deliveryFee < 0
  ) {
    alert(
      "Enter the confirmed delivery fee first."
    );
    return;
  }

  setCreatingPaymentLinkOrderId(
    order.id
  );

  try {
    const saveRes = await fetch(
      "/api/admin/update-order-meta",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          orderId: order.orderId,
          deliveryFee:
            order.deliveryFee,
          adminNotes:
            order.adminNotes,
        }),
      }
    );

    const saveResult =
      await saveRes.json();

    if (!saveRes.ok) {
      throw new Error(
        saveResult?.error ||
          "Unable to save the confirmed delivery fee."
      );
    }

    const linkRes = await fetch(
      `/api/admin/orders/${order.id}/payment-link`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const linkResult =
      await linkRes.json();

    if (!linkRes.ok) {
      throw new Error(
        linkResult?.error ||
          "Unable to create payment link."
      );
    }

    const paymentUrl =
      linkResult?.paymentUrl;

    const amountPesewas =
      linkResult?.order
        ?.amountPesewas;

    if (
      typeof paymentUrl !==
        "string" ||
      !paymentUrl
    ) {
      throw new Error(
        "Secure payment link was not returned."
      );
    }

    if (
      !Number.isSafeInteger(
        amountPesewas
      ) ||
      amountPesewas <= 0
    ) {
      throw new Error(
        "The confirmed payable total is invalid."
      );
    }

    const payableGhs =
      amountPesewas / 100;

    const deliveryFee =
      Number(
        order.deliveryFee
      );

    const message =
      `Hello, your delivery charge for order ${order.orderId} has been confirmed.` +
      `\n\nDelivery: GHS ${deliveryFee.toFixed(2)}` +
      `\nTotal payable: GHS ${payableGhs.toFixed(2)}` +
      `\n\nPlease use this secure DeeGlobalGH link to review the order and complete payment:` +
      `\n${paymentUrl}` +
      `\n\nThank you for choosing DeeGlobalGH.`;

    const phone =
      order.phone.replace(
        /^0/,
        "233"
      );

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    await loadOrders();
  } catch (error) {
    console.error(
      "Error creating payment link:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Unable to create payment link."
    );
  } finally {
    setCreatingPaymentLinkOrderId(
      null
    );
  }
};
const handleSendReport = async () => {
  try {
    const res = await fetch("/api/admin/daily-report");
    const data = await res.json();

    const message = encodeURIComponent(data.message);

    const phones = [
  "233246011773", // You
  "233541131111", // Second number
];

    phones.forEach((phone) => {
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, "_blank");
});
  } catch (error) {
   
  }
};

const supplierPhones: Record<string, string> = {
  "Aki Ola": "233270030000",
  "A+": "233246011773",
  "Golden": "23354113111",
  "Best Brain": "233270030000",
  "Excellence": "233270030000",
  "Essential": "23354113111",
  "Auntie Diana": "23354113111",
  "DWT": "23354113111",
  "Wuchard": "23354113111",
  "Tsina": "233246011773",
  "Makola": "233246011773",
  "Wise Ant": "233246011773",
  "Don": "233246011773",
  "Nataraj": "233246011773",
  "Skoolbox": "233246011773",
};

const handleSendRestock = () => {
  const suppliers = Object.keys(restockBySupplier);

  if (suppliers.length === 0) {
    alert("No restock needed");
    return;
  }

  suppliers.forEach((supplier) => {
    const items = restockBySupplier[supplier];

    let total = 0;

    const lines = items.map((p, i) => {
      const itemTotal = p.restockQty * p.unitCost;
      total += itemTotal;

      return `${i + 1}. ${p.name}
Qty: ${p.restockQty}
Unit: GHS ${p.unitCost}
Total: GHS ${itemTotal}`;
    });

    const message = `RESTOCK ORDER – ${supplier.toUpperCase()}

${lines.join("\n\n")}

-------------------------
TOTAL: GHS ${total}`;

    const encoded = encodeURIComponent(message);

const phone = supplierPhones[supplier] || "233246011773";
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  });
};
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">
        Database Orders (Admin)
      </h1>
<div className="mb-4">
  <button
    onClick={handleSendReport}
    className="bg-green-600 text-white px-4 py-2 rounded-lg"
  >
    Send Daily Report
  </button>
</div>

<button

  onClick={handleSendRestock}
  className="bg-red-600 text-white px-4 py-2 rounded-lg ml-2"
>
  Send Restock Order
</button>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">Total Orders</p>
    <p className="text-xl font-bold">{totalOrders}</p>
  </div>

<div className="p-4 bg-white border rounded-xl">
  <p className="text-sm text-gray-500">Avg Order (GHS)</p>
  <p className="text-xl font-bold">
    {averageOrderValue.toFixed(2)}
  </p>
</div>

  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">Today (GHS)</p>
    <p className="text-xl font-bold">{todayRevenue.toFixed(2)}</p>
  </div>

  <div className="p-4 bg-white border rounded-xl">
  <p className="text-sm text-gray-500">Items Sold Today</p>
  <p className="text-xl font-bold">{todayItemsSold}</p>
</div>


  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">This Week</p>
    <p className="text-xl font-bold">{weekRevenue.toFixed(2)}</p>
  </div>

  <div className="p-4 bg-white border rounded-xl">
  <p className="text-sm text-gray-500">Items This Week</p>
  <p className="text-xl font-bold">{weekItemsSold}</p>
</div>

  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">This Month</p>
    <p className="text-xl font-bold">{monthRevenue.toFixed(2)}</p>
  </div>

<div className="p-4 bg-white border rounded-xl">
  <p className="text-sm text-gray-500">Items This Month</p>
  <p className="text-xl font-bold">{monthItemsSold}</p>
</div>

  <div className="p-4 bg-white border rounded-xl">
    <p className="text-sm text-gray-500">Total Revenue</p>
    <p className="text-xl font-bold">{totalRevenue.toFixed(2)}</p>
  </div>

  <div className="mt-8 bg-white border rounded-xl p-4">
  <h2 className="font-bold mb-3">Top Selling Products (Today)</h2>
  

  {topProductsToday.length === 0 ? (
  <p className="text-sm text-gray-500">No sales today</p>
) : (
  <ul className="text-sm space-y-1">
    {topProductsToday.map((p, i) => (
      <li key={i}>
        {i + 1}. {p.name} — {p.qty} pcs
      </li>
    ))}
  </ul>
)}
</div>

<div className="mt-8 bg-white border rounded-xl p-4">
  <h2 className="font-bold mb-3">Fast Moving Products</h2>

  {fastMovingProducts.length === 0 ? (
    <p className="text-sm text-gray-500">No product movement yet</p>
  ) : (
    <ul className="text-sm space-y-2">
      {fastMovingProducts.map((p, i) => (
        <li
          key={i}
          className="flex justify-between items-center"
        >
          <div>
            {i + 1}. {p.name} — {p.qty} pcs
          </div>

          <span
            className={`text-xs px-2 py-1 rounded ${
              p.demandLevel === "HIGH"
                ? "bg-red-100 text-red-600"
                : p.demandLevel === "MEDIUM"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {p.demandLevel}
          </span>
        </li>
      ))}
    </ul>
  )}
</div>
<div className="mt-8 bg-red-100 border border-red-300 rounded-xl p-4">
  <h2 className="font-bold mb-3 text-red-800">
    🚨 Critical Stock (Immediate Action)
  </h2>

  {criticalStockProducts.length === 0 ? (
    <p className="text-sm text-gray-600">
      No critical stock issues
    </p>
  ) : (
    <ul className="text-sm space-y-2">
      {criticalStockProducts.map((p, i) => (
        <li key={p.id} className="flex justify-between">
          <span>
            {i + 1}. {p.name}
          </span>

          <span className="text-red-800 font-bold">
            {p.stockQty} left
          </span>
        </li>
      ))}
    </ul>
  )}
</div>

<div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
  <h2 className="font-bold mb-3 text-red-700">
    🔥 Restock Priority (Smart Alert)
  </h2>

  {smartLowStockProducts.length === 0 ? (
    <p className="text-sm text-gray-500">
      No urgent restock needed
    </p>
  ) : (
    <ul className="text-sm space-y-2">
      {prioritizedRestock.map((p, i) => (
        <li
          key={i}
          className="flex justify-between items-center"
        >
          <div>
            {i + 1}. {p.name}
          </div>

          <div className="flex flex-col items-end">
            <span
              className={`text-xs px-2 py-1 rounded ${
                p.demandLevel === "HIGH"
                  ? "bg-red-100 text-red-600"
                  : p.demandLevel === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {p.demandLevel}
            </span>

            <div className="flex items-center gap-2">
  <div className="text-right">
  <div className="text-green-700 font-semibold">
    → Restock +{p.restockQty}
  </div>

  <div className="text-green-700">
    GHS {p.restockCost || 0}
  </div>

  <div className="text-xs text-gray-500">
    ({p.restockQty} × {p.unitCost || 0})
  </div>

  {p.unitCost === 0 && (
    <div className="text-xs text-red-500 font-semibold">
      ⚠ Missing cost price
    </div>
  )}
</div>


</div>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>

<div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
  <h2 className="font-bold mb-3 text-red-600">
    ⚠️ Low Stock Alert
  </h2>

{lowStockProductsFromDB.length === 0 ? (
      <p className="text-sm text-gray-500">
      No low stock risks detected
    </p>
  ) : (
    <ul className="text-sm space-y-2">
{lowStockProductsFromDB.map((p, i) => (
          <li key={i} className="flex justify-between">
          <span>
            {p.name}
          </span>

          <span className="text-red-600 font-bold">
            {p.stockQty} left
          </span>
        </li>
      ))}
    </ul>
  )}
</div>

</div>


      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by Order ID or Phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded border px-3 py-2"
      />

      {/* STATUS FILTER */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {["ALL", "PAID", "PROCESSING", "DELIVERED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* DATE FILTER */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {["ALL", "TODAY", "WEEK", "MONTH"].map((d) => (
          <button
            key={d}
            onClick={() => setDateFilter(d as any)}
            className={`px-3 py-1 rounded ${
              dateFilter === d
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {d === "ALL"
              ? "ALL TIME"
              : d === "TODAY"
              ? "TODAY"
              : d === "WEEK"
              ? "THIS WEEK"
              : "THIS MONTH"}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading orders…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Delivery Fee</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders
  .sort((a, b) => {
    const getPriority = (status: string) => {
      if (status === "PAID") return 1;
      if (status === "DELIVERING" || status === "PROCESSING") return 2;
      if (status === "COMPLETED" || status === "DELIVERED") return 3;
      return 4;
    };

    return getPriority(a.paymentStatus) - getPriority(b.paymentStatus);
  })
  .filter((o) => {
                  const status =
                    o.paymentStatus === "DELIVERING"
                      ? "PROCESSING"
                      : o.paymentStatus === "COMPLETED"
                      ? "DELIVERED"
                      : o.paymentStatus;

                  if (filter !== "ALL" && status !== filter)
                    return false;

                  if (search) {
                    const q = search.toLowerCase();
                    if (
                      !o.orderId.toLowerCase().includes(q) &&
                      !o.phone.toLowerCase().includes(q)
                    )
                      return false;
                  }

                  const orderDate = new Date(o.createdAt);
                  const now = new Date();

                  if (dateFilter === "TODAY") {
                    if (
                      orderDate.toDateString() !==
                      now.toDateString()
                    )
                      return false;
                  }

                  if (dateFilter === "WEEK") {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    if (orderDate < oneWeekAgo) return false;
                  }

                  if (dateFilter === "MONTH") {
                    if (
                      orderDate.getMonth() !== now.getMonth() ||
                      orderDate.getFullYear() !==
                        now.getFullYear()
                    )
                      return false;
                  }

                  return true;
                })
                .map((o) => (
                  <tr
  key={o.id}
  className={(() => {
    const isToday =
      new Date(o.createdAt).toDateString() ===
      new Date().toDateString();

    if (isToday) return "bg-purple-20"; // 👈 TODAY highlight

    if (o.paymentStatus === "PAID") return "bg-yellow-50";
    if (o.paymentStatus === "DELIVERING") return "bg-blue-50";
    if (o.paymentStatus === "COMPLETED") return "bg-green-50";

    return "";
  })()}
>
  
                    <td className="px-4 py-3">
  <div className="flex items-center gap-2">
    {o.orderId}

    {new Date(o.createdAt) >
      new Date(Date.now() - 24 * 60 * 60 * 1000) && (
      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
        NEW
      </span>
    )}
  </div>
</td>

                    <td className="px-4 py-3">{o.phone}</td>
                    <td className="px-4 py-3">
  <div className="flex flex-col">
    <span>GHS {o.amount.toFixed(2)}</span>

    <span className="text-xs text-gray-600">
      {o.orderItems.reduce((sum, i) => sum + i.quantity, 0)} items
    </span>
  </div>
</td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={o.deliveryFee ?? ""}
                        onChange={(e) =>
                          setOrders((prev) =>
                            prev.map((x) =>
                              x.id === o.id
                                ? {
                                    ...x,
                                    deliveryFee: e.target.value
                                      ? Number(e.target.value)
                                      : null,
                                  }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="px-4 py-3">
                      <textarea
                        value={o.adminNotes ?? ""}
                        onChange={(e) =>
                          setOrders((prev) =>
                            prev.map((x) =>
                              x.id === o.id
                                ? {
                                    ...x,
                                    adminNotes: e.target.value,
                                  }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="px-4 py-3 font-bold">
  {(() => {
    const status =
      o.paymentStatus === "DELIVERING"
        ? "PROCESSING"
        : o.paymentStatus === "COMPLETED"
        ? "DELIVERED"
        : o.paymentStatus;

    return (
      <div className="flex items-center gap-2">
        <span>{status}</span>

        {status === "PAID" && (
          <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
            ACTION NEEDED
          </span>
        )}
      </div>
    );
  })()}
</td>

                    <td className="px-4 py-3 text-xs">
                      {new Date(
                        o.createdAt
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
{!["PAID", "DELIVERING", "COMPLETED"].includes(
  o.paymentStatus
) && (
  <div className="mb-3 space-y-2">
    <button
      type="button"
      onClick={() => saveMeta(o)}
      disabled={
        savingOrderId === o.orderId ||
        creatingPaymentLinkOrderId === o.id
      }
      className="block w-full rounded bg-gray-800 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {savingOrderId === o.orderId
        ? "Saving..."
        : "Save Delivery Fee"}
    </button>

    <button
      type="button"
      onClick={() => sendPaymentLink(o)}
      disabled={
        creatingPaymentLinkOrderId === o.id ||
        savingOrderId === o.orderId
      }
      className="block w-full rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {creatingPaymentLinkOrderId === o.id
        ? "Preparing Link..."
        : "Send Payment Link"}
    </button>
  </div>
)}
                      <button
  onClick={() => setSelectedOrder(o)}
  className="block mb-2 text-sm text-indigo-600 underline"
>
  👁 View Details
</button>
                      <a
  href={`tel:${o.phone}`}
  className="block mb-2 text-blue-600 underline text-sm"
>
  📞 Call Customer
  
</a>

<a
  href={`https://wa.me/${o.phone.replace(/^0/, "233")}?text=${encodeURIComponent(
    `Hello, your order (${o.orderId}) from DeeglobalGh is being processed. We will contact you shortly.`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="block mb-2 text-green-600 underline text-sm"
>
  💬 WhatsApp Customer
</a>
                      {o.paymentStatus === "PAID" && (
                        <button
                          onClick={() =>
                            updateStatus(o.id, "PROCESSING")
                          }
                        >
                          Start Processing
                        </button>
                      )}

                      {(o.paymentStatus === "DELIVERED" ||
  o.paymentStatus === "COMPLETED") && (
  <button
    onClick={() =>
      window.location.href = `/admin/returns/new?order=${o.id}`
    }
    className="block mb-2 text-purple-700 underline text-sm"
  >
    ↩ Create Return
  </button>
)}

                      {(o.paymentStatus === "DELIVERING" ||
                        o.paymentStatus === "PROCESSING") && (
                        <button
                          onClick={() =>
                            updateStatus(o.id, "DELIVERED")
                          }
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-6 w-full max-w-lg print-area">
      <h2 className="text-xl font-bold mb-4">
        Order Details
      </h2>

      <p className="mb-2">
        <strong>Order ID:</strong> {selectedOrder.orderId}
      </p>

      <p className="mb-2">
        <strong>Phone:</strong> {selectedOrder.phone}
      </p>

      <p className="mb-2">
        <strong>Total:</strong> GHS {selectedOrder.amount.toFixed(2)}
        
      </p>
<p className="mb-2">
  <strong>Total Items:</strong>{" "}
  {selectedOrder.orderItems.reduce((sum, i) => sum + i.quantity, 0)}
</p>

<p className="mb-2">
  <strong>Delivery Fee:</strong>{" "}
  {selectedOrder.deliveryFee
    ? `GHS ${selectedOrder.deliveryFee}`
    : "Not set"}
</p>

<p className="mb-2">
  <strong>Notes:</strong>{" "}
  {selectedOrder.adminNotes || "No notes"}
</p>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Items:</h3>

        <ul className="space-y-1 text-sm">
          {selectedOrder.orderItems.map((item, index) => (
  <li key={index}>
    {item.product?.name || "Product"} — Qty: {item.quantity}
  </li>
))}
        </ul>
      </div>

      <button
        onClick={() => setSelectedOrder(null)}
        className="mt-6 w-full bg-black text-white py-2 rounded"
      >
        

        Close
      </button>
<button
onClick={() => {
  if (!selectedOrder) return;

  const items = selectedOrder.orderItems
    .map(
      (item, i) =>
        `${i + 1}. ${item.product?.name || "Item"} x${item.quantity}`
    )
    .join("<br/>");

  const html = `
    <html>
      <head>
        <title>Order Slip</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h2 {
            margin-bottom: 10px;
          }
          .section {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h2>DeeglobalGh</h2>
        <p>Order Packing Slip</p>

        <div class="section"><strong>Order ID:</strong> ${selectedOrder.orderId}</div>
        <div class="section"><strong>Phone:</strong> ${selectedOrder.phone}</div>
        <div class="section"><strong>Total:</strong> GHS ${selectedOrder.amount}</div>
        <div class="section"><strong>Delivery Fee:</strong> ${
          selectedOrder.deliveryFee ?? "Not set"
        }</div>

        <div class="section"><strong>Items:</strong><br/>${items}</div>

        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}}  className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
>
  🖨 Print Packing Slip
</button>
    </div>
  </div>
)}
    </main>
  );
}