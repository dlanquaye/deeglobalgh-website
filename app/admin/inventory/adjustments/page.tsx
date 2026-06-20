import { prisma } from "@/lib/prisma";

export default async function AdjustmentHistoryPage() {
  const adjustments = await prisma.stockMovement.findMany({
  where: {
    type: "ADJUSTMENT",
  },
  orderBy: {
    createdAt: "desc",
  },
});
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Inventory Adjustments
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Product ID</th>
              <th className="border p-2 text-left">Quantity</th>
              <th className="border p-2 text-left">Location</th>
              <th className="border p-2 text-left">Staff</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {adjustments.map((adjustment) => (
              <tr key={adjustment.id}>
                <td className="border p-2">
                  {adjustment.productId}
                </td>

                <td className="border p-2">
                  {adjustment.quantity}
                </td>

                <td className="border p-2">
                  {adjustment.fromLocationType}
                </td>

                <td className="border p-2">
                  {adjustment.createdByStaffId}
                </td>

                <td className="border p-2">
                  {adjustment.status}
                </td>

                <td className="border p-2">
                  {new Date(
                    adjustment.createdAt
                  ).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}