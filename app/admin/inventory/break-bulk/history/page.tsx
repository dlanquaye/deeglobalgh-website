import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BreakBulkHistoryPage() {
  const conversions =
    await prisma.breakBulkConversion.findMany({
      include: {
        sourceProduct: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        destinationProduct: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Break Bulk Conversion History
        </h1>

        <p className="mt-1 text-gray-600">
          Showing the most recent{" "}
          {conversions.length} Break Bulk
          conversions.
        </p>
      </div>

      {conversions.length === 0 ? (
        <div className="border rounded-xl p-6 text-gray-600">
          No successful Break Bulk conversions
          have been recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">
                  Date
                </th>

                <th className="p-3 text-left">
                  Source Product
                </th>

                <th className="p-3 text-left">
                  Source Stock
                </th>

                <th className="p-3 text-left">
                  Converted
                </th>

                <th className="p-3 text-left">
                  Ratio
                </th>

                <th className="p-3 text-left">
                  Destination Product
                </th>

                <th className="p-3 text-left">
                  Created
                </th>

                <th className="p-3 text-left">
                  Destination Stock
                </th>

                <th className="p-3 text-left">
                  Location
                </th>

                <th className="p-3 text-left">
                  Actor
                </th>

                <th className="p-3 text-left">
                  Note
                </th>
              </tr>
            </thead>

            <tbody>
              {conversions.map(
                (conversion) => (
                  <tr
                    key={conversion.id}
                    className="border-b last:border-b-0 align-top"
                  >
                    <td className="p-3 whitespace-nowrap">
                      {conversion.createdAt.toLocaleString(
                        "en-GB"
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-medium">
                        {
                          conversion.sourceProduct
                            .name
                        }
                      </div>

                      <div className="text-xs text-gray-500">
                        SKU:{" "}
                        {conversion.sourceProduct
                          .sku || "—"}
                      </div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div>
                        Before:{" "}
                        <strong>
                          {
                            conversion.sourceQuantityBefore
                          }
                        </strong>
                      </div>

                      <div>
                        After:{" "}
                        <strong>
                          {
                            conversion.sourceQuantityAfter
                          }
                        </strong>
                      </div>
                    </td>

                    <td className="p-3 font-semibold">
                      {
                        conversion.sourceQuantityConverted
                      }
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      1 →{" "}
                      <strong>
                        {
                          conversion.conversionRatio
                        }
                      </strong>
                    </td>

                    <td className="p-3">
                      <div className="font-medium">
                        {
                          conversion
                            .destinationProduct
                            .name
                        }
                      </div>

                      <div className="text-xs text-gray-500">
                        SKU:{" "}
                        {conversion
                          .destinationProduct
                          .sku || "—"}
                      </div>
                    </td>

                    <td className="p-3 font-semibold">
                      {
                        conversion.destinationQuantityCreated
                      }
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div>
                        Before:{" "}
                        <strong>
                          {
                            conversion.destinationQuantityBefore
                          }
                        </strong>
                      </div>

                      <div>
                        After:{" "}
                        <strong>
                          {
                            conversion.destinationQuantityAfter
                          }
                        </strong>
                      </div>
                    </td>

                    <td className="p-3">
                      <div>
                        {conversion.locationType}
                      </div>

                      <div className="text-xs text-gray-500 break-all">
                        {conversion.locationId}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="text-sm break-all">
                        {
                          conversion.createdByStaffId
                        }
                      </div>
                    </td>

                    <td className="p-3">
                      {conversion.note || "—"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {conversions.length > 0 && (
        <div className="border rounded-xl p-4">
          <h2 className="font-semibold mb-2">
            Audit References
          </h2>

          <div className="space-y-3">
            {conversions.map(
              (conversion) => (
                <div
                  key={conversion.id}
                  className="text-sm border-b last:border-b-0 pb-3 last:pb-0"
                >
                  <div>
                    <strong>
                      Conversion:
                    </strong>{" "}
                    <span className="break-all">
                      {conversion.id}
                    </span>
                  </div>

                  <div>
                    <strong>
                      Source movement:
                    </strong>{" "}
                    <span className="break-all">
                      {
                        conversion.sourceMovementId
                      }
                    </span>
                  </div>

                  <div>
                    <strong>
                      Destination movement:
                    </strong>{" "}
                    <span className="break-all">
                      {
                        conversion.destinationMovementId
                      }
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}