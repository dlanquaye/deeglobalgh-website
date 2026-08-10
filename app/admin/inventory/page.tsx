import { prisma } from "@/lib/prisma";
import { LocationType } from "@prisma/client";

export default async function InventoryPage() {
  const inventoryCount = await prisma.inventory.count();
  const warehouseCount = await prisma.inventory.count({
  where: {
    locationType: LocationType.WAREHOUSE,
  },
});

const branchCount = await prisma.inventory.count({
  where: {
    locationType: LocationType.BRANCH,
  },
});

const warehouseStock = await prisma.inventory.aggregate({
  where: {
    locationType: LocationType.WAREHOUSE,
  },
  _sum: {
    quantity: true,
  },
});

const branchStock = await prisma.inventory.aggregate({
  where: {
    locationType: LocationType.BRANCH,
  },
  _sum: {
    quantity: true,
  },
});

const recentMovements = await prisma.stockMovement.findMany({
  orderBy: {
    createdAt: "desc",
  },
  take: 10,
});


const lowStockItems = await prisma.inventory.findMany({
  where: {
    quantity: {
      lte: 5,
    },
  },
  orderBy: {
    quantity: "asc",
  },
  take: 20,
});


const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
  },
});

const productMap = new Map(
  products.map((product) => [
    product.id,
    product.name,
  ])
);

const warehouseInventory = await prisma.inventory.findMany({
  where: {
    locationType: LocationType.WAREHOUSE,
  },
  orderBy: {
    quantity: "desc",
  },
  take: 50,
});

const branchInventory = await prisma.inventory.findMany({
  where: {
    locationType: LocationType.BRANCH,
  },
  orderBy: {
    quantity: "desc",
  },
  take: 50,
});

const inventorySummary = await prisma.inventory.groupBy({
  by: ["productId"],
  _sum: {
    quantity: true,
  },
  orderBy: {
    _sum: {
      quantity: "desc",
    },
  },
  take: 50,
});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Inventory Dashboard
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
  <a
    href="/admin/inventory/receive"
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Receive Stock
  </a>

<a
  href="/admin/inventory/movements"
  className="bg-gray-700 text-white px-4 py-2 rounded"
>
  View Movements
</a>

  <a
    href="/admin/inventory/transfer"
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Transfer Stock
  </a>

  <a
  href="/admin/inventory/transfers"
  className="bg-purple-600 text-white px-4 py-2 rounded"
>
  Transfer History
</a>

<a
  href="/admin/inventory/receipts"
  className="bg-orange-600 text-white px-4 py-2 rounded"
>
  Receive History
</a>

<a
  href="/admin/inventory/adjustment"
  className="bg-red-600 text-white px-4 py-2 rounded"
>
  Inventory Adjustment
</a>

<a
  href="/admin/inventory/adjustments"
  className="bg-indigo-600 text-white px-4 py-2 rounded"
>
  View Adjustments
</a>

<a
  href="/admin/inventory/break-bulk"
  className="bg-teal-600 text-white px-4 py-2 rounded"
>
  Break Bulk
</a>

<a
  href="/admin/inventory/break-bulk/history"
  className="bg-slate-700 text-white px-4 py-2 rounded"
>
  Break Bulk History
</a>


</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

  <div className="border rounded p-4">
    <p>Total Inventory Records</p>
    <p className="text-3xl font-bold">
      {inventoryCount}
    </p>
  </div>

  <div className="border rounded p-4">
    <p>Warehouse Records</p>
    <p className="text-3xl font-bold">
      {warehouseCount}
    </p>
  </div>

  <div className="border rounded p-4">
    <p>Branch Records</p>
    <p className="text-3xl font-bold">
      {branchCount}
    </p>
  </div>
  

<div className="border rounded p-4">
  <p>Warehouse Stock Units</p>
  <p className="text-3xl font-bold">
    {warehouseStock._sum.quantity ?? 0}
  </p>
</div>

<div className="border rounded p-4">
  <p>Branch Stock Units</p>
  <p className="text-3xl font-bold">
    {branchStock._sum.quantity ?? 0}
  </p>
</div>

</div>

<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">
    Low Stock Alerts
  </h2>

  <table className="w-full border">
    <thead>
      <tr className="border-b">
        <th className="text-left p-2">Product</th>
        <th className="text-left p-2">Location</th>
        <th className="text-left p-2">Quantity</th>
      </tr>
    </thead>

    <tbody>
      {lowStockItems.map((item) => (
        <tr key={item.id} className="border-b">
          <td className="p-2">
  {productMap.get(item.productId) ?? item.productId}
</td>
          <td className="p-2">{item.locationType}</td>
          <td className="p-2">{item.quantity}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">
    Recent Stock Movements
  </h2>

  <table className="w-full border">
    <thead>
      <tr className="border-b">
        <th className="text-left p-2">Type</th>
        <th className="text-left p-2">Quantity</th>
        <th className="text-left p-2">From</th>
        <th className="text-left p-2">To</th>
        <th className="text-left p-2">Created By</th>
        <th className="text-left p-2">Status</th>
        <th className="text-left p-2">Date</th>
      </tr>
    </thead>

    <tbody>
      {recentMovements.map((movement) => (
        <tr key={movement.id} className="border-b">
          <td className="p-2">{movement.type}</td>
          <td className="p-2">{movement.quantity}</td>
          <td className="p-2">{movement.fromLocationType ?? "-"}</td>
          <td className="p-2">{movement.toLocationType ?? "-"}</td>
          <td className="p-2">{movement.createdByStaffId}</td>
          <td className="p-2">{movement.status}</td>
          <td className="p-2">
            {movement.createdAt.toLocaleString()}
          </td>
        </tr>
      ))}
      
    </tbody>
  </table>

<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">
    Product Inventory Summary
  </h2>

  <table className="w-full border">
    <thead>
      <tr className="border-b">
        <th className="text-left p-2">Product</th>
        <th className="text-left p-2">Total Units</th>
      </tr>
    </thead>

    <tbody>
      {inventorySummary.map((item) => (
        <tr key={item.productId} className="border-b">
          <td className="p-2">
            {productMap.get(item.productId) ?? item.productId}
          </td>

          <td className="p-2">
            {item._sum.quantity ?? 0}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  <div className="mt-8">
  <h2 className="text-xl font-bold mb-4">
    Warehouse Inventory
  </h2>

  <table className="w-full border">
    <thead>
      <tr className="border-b">
        <th className="text-left p-2">Product</th>
        <th className="text-left p-2">Quantity</th>
      </tr>
    </thead>

    <tbody>
      {warehouseInventory.map((item) => (
        <tr key={item.id} className="border-b">
          <td className="p-2">
            {productMap.get(item.productId) ?? item.productId}
          </td>

          <td className="p-2">
            {item.quantity}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">
    Branch Inventory
  </h2>

  <table className="w-full border">
    <thead>
      <tr className="border-b">
        <th className="text-left p-2">Product</th>
        <th className="text-left p-2">Quantity</th>
      </tr>
    </thead>

    <tbody>
      {branchInventory.map((item) => (
        <tr key={item.id} className="border-b">
          <td className="p-2">
            {productMap.get(item.productId) ?? item.productId}
          </td>

          <td className="p-2">
            {item.quantity}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

</div>
</div>
);
}