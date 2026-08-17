import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getEstimateAttachments } from "@/lib/estimator/getEstimateAttachments";

import AddBookForm from "./AddBookForm";
import UploadSchoolList from "./UploadSchoolList";
import UploadedFiles from "./UploadedFiles";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EstimateDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const estimate = await prisma.estimateRequest.findUnique({
    where: {
      id,
    },

    include: {
      items: {
        include: {
          product: true,
        },

        orderBy: {
          lineNumber: "asc",
        },
      },
    },
  });

  if (!estimate) {
    notFound();
  }

  const attachments =
    await getEstimateAttachments(
      estimate.id
    );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Estimate{" "}
            {estimate.estimateNumber}
          </h1>

          <p className="mt-2 text-gray-600">
            {estimate.customerName}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/estimator/${estimate.id}/quotation`}
            className="rounded-lg bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          >
            View Quotation / Proforma
          </Link>

          <Link
            href="/admin/estimator"
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Back
          </Link>
        </div>
      </div>

      {/* ==========================================
          CUSTOMER / SCHOOL DETAILS
      ========================================== */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">
            Phone
          </div>

          <div className="font-semibold">
            {estimate.phone}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">
            School
          </div>

          <div className="font-semibold">
            {estimate.schoolName ??
              "-"}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">
            Class
          </div>

          <div className="font-semibold">
            {estimate.className ??
              "-"}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">
            Academic Year
          </div>

          <div className="font-semibold">
            {estimate.academicYear ??
              "-"}
          </div>
        </div>
      </div>

      {/* ==========================================
          ESTIMATOR TOOLS
      ========================================== */}
      <div className="mt-8">
        <UploadSchoolList
          estimateId={estimate.id}
        />

        <UploadedFiles
          attachments={attachments}
        />

        <AddBookForm
          estimateId={estimate.id}
        />
      </div>

      {/* ==========================================
          ESTIMATE ITEMS
      ========================================== */}
      <div className="mt-8 overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-4">
          <h2 className="text-xl font-bold">
            Estimate Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  #
                </th>

                <th className="px-4 py-3 text-left">
                  Description
                </th>

                <th className="px-4 py-3 text-left">
                  Matched Product
                </th>

                <th className="px-4 py-3 text-left">
                  Qty
                </th>

                <th className="px-4 py-3 text-left">
                  Confidence
                </th>

                <th className="px-4 py-3 text-left">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {estimate.items.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No books have
                    been added yet.
                  </td>
                </tr>
              ) : (
                estimate.items.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                      className="border-t"
                    >
                      <td className="px-4 py-3">
                        {
                          item.lineNumber
                        }
                      </td>

                      <td className="px-4 py-3">
                        {
                          item.description
                        }
                      </td>

                      <td className="px-4 py-3">
                        {item.product
                          ?.name ??
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        {
                          item.quantity
                        }
                      </td>

                      <td className="px-4 py-3">
                        {item.matchConfidence ??
                          "-"}
                        %
                      </td>

                      <td className="px-4 py-3">
                        {item.totalPrice
                          ? `GHS ${Number(
                              item.totalPrice
                            ).toFixed(
                              2
                            )}`
                          : "-"}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
