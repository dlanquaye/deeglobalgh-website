import { prisma } from "@/lib/prisma";

export default async function TransferHistoryPage() {
  const transfers = await prisma.stockMovement.findMany({
    where: {
      type: "TRANSFER",
    },
    orderBy: {
      createdAt: "desc",
    },
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Transfer History
      </h1>

      <>
  <p className="mb-4">
    Total Transfers: {transfers.length}
  </p>

  <table className="w-full border">
    <thead>
      <tr className="border-b">
        <th className="p-2 text-left">Product</th>
<th className="p-2 text-left">Quantity</th>
<th className="p-2 text-left">From</th>
<th className="p-2 text-left">To</th>
<th className="p-2 text-left">Date</th>
      </tr>
    </thead>

    <tbody>

        {transfers.map((transfer) => (
  <tr key={transfer.id} className="border-b">
    <td className="p-2">
      {productMap.get(transfer.productId) ??
        transfer.productId}
    </td>

    <td className="p-2">
  {transfer.quantity} units
</td>

<td className="p-2">
  {transfer.fromLocationType
    ? transfer.fromLocationType === "WAREHOUSE"
      ? "Warehouse"
      : "Branch"
    : "-"}
</td>

<td className="p-2">
  {transfer.toLocationType
    ? transfer.toLocationType === "WAREHOUSE"
      ? "Warehouse"
      : "Branch"
    : "-"}
</td>

<td className="p-2">
  {transfer.createdAt.toLocaleDateString("en-GB")}
</td>

  </tr>
  
))}

    </tbody>
  </table>
</>
    </div>
  );
}