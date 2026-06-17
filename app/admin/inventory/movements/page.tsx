import { prisma } from "@/lib/prisma";

export default async function InventoryMovementsPage() {
  const movements = await prisma.stockMovement.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Inventory Movements
      </h1>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Quantity</th>
            <th className="p-2 text-left">From</th>
            <th className="p-2 text-left">To</th>
            <th className="p-2 text-left">Staff</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Date</th>
          </tr>
        </thead>

        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id} className="border-b">
              <td className="p-2">{movement.type}</td>
              <td className="p-2">{movement.quantity}</td>
              <td className="p-2">
                {movement.fromLocationType ?? "-"}
              </td>
              <td className="p-2">
                {movement.toLocationType ?? "-"}
              </td>
              <td className="p-2">
                {movement.createdByStaffId}
              </td>
              <td className="p-2">
                {movement.status}
              </td>
              <td className="p-2">
                {movement.createdAt.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}