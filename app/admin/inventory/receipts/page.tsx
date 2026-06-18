import { prisma } from "@/lib/prisma";

export default async function ReceiptHistoryPage() {
  const receipts = await prisma.stockMovement.findMany({
    where: {
      type: "PURCHASE",
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
        Receive Stock History
      </h1>

      <>
  <p className="mb-4">
    Total Receipts: {receipts.length}
  </p>

  <table className="w-full border">
    <thead>
      <tr className="border-b">
        <th className="p-2 text-left">Product</th>
<th className="p-2 text-left">Quantity</th>
<th className="p-2 text-left">Received By</th>
<th className="p-2 text-left">Date</th>
      </tr>
    </thead>

    <tbody>

        {receipts.map((receipt) => (
  <tr key={receipt.id} className="border-b">
    <td className="p-2">
      {productMap.get(receipt.productId) ??
        receipt.productId}
    </td>

    <td className="p-2">
  {receipt.quantity} units
</td>

<td className="p-2">
  {receipt.createdByStaffId}
</td>

<td className="p-2">
  {receipt.createdAt.toLocaleDateString("en-GB")}
</td>


  </tr>
))}

    </tbody>
  </table>
</>
    </div>
  );
}