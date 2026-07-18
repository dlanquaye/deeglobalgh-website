import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function EstimatorDashboardPage() {
  const estimates = await prisma.estimateRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      items: true,
    },
  });

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            School List Estimator
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create quotations from school book lists using the Knowledge Engine.
          </p>
        </div>

        <Link
          href="/admin/estimator/new"
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
        >
          + New Estimate
        </Link>

      </div>

      <div className="overflow-hidden rounded-xl border bg-white">

        <table className="min-w-full">

          <thead className="bg-gray-50">

            <tr className="text-left text-sm font-semibold">
              <th className="px-4 py-3">Estimate No.</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>

          </thead>

          <tbody>

            {estimates.length === 0 ? (

              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No estimates have been created yet.
                </td>
              </tr>

            ) : (

              estimates.map((estimate) => (

                <tr
                  key={estimate.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >

                  <td className="px-4 py-3">

                    <Link
                      href={`/admin/estimator/${estimate.id}`}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      {estimate.estimateNumber}
                    </Link>

                  </td>

                  <td className="px-4 py-3">
                    {estimate.customerName}
                  </td>

                  <td className="px-4 py-3">
                    {estimate.schoolName ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    {estimate.className ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    {estimate.items.length}
                  </td>

                  <td className="px-4 py-3">
                    {estimate.status}
                  </td>

                  <td className="px-4 py-3">
                    {estimate.createdAt.toLocaleDateString()}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}