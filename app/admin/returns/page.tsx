import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ReturnsPage() {
  try {
    const returns = await prisma.returnRequest.findMany({
      include: {
        order: true,
        branch: true,
        requestedByStaff: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return (
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Returns & Exchanges
          </h1>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Return No.</th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Requested By</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>

            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.returnNumber}</td>
                  <td className="p-3">{r.order.orderId}</td>
                  <td className="p-3">{r.type}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{r.requestedByStaff.name}</td>
                  <td className="p-3">
                    {r.createdAt.toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/admin/returns/${r.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {returns.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-gray-500"
                  >
                    No return requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    );
  } catch {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold text-blue-900">
          Returns & Exchanges
        </h1>

        <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-6">
          <h2 className="text-xl font-semibold">
            Module Not Yet Initialised
          </h2>

          <p className="mt-3 text-gray-700">
            The Returns database tables have not been created yet.
            Once the database migration is completed, this module
            will become available automatically.
          </p>
        </div>
      </main>
    );
  }
}