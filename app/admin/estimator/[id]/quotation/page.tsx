import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import PrintQuotationButton from "./PrintQuotationButton";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatMoney(
  amount: number
) {
  return new Intl.NumberFormat(
    "en-GH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

function formatDate(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(value);
}

export default async function EstimateQuotationPage({
  params,
}: PageProps) {
  const { id } = await params;

  const estimate =
    await prisma.estimateRequest.findUnique({
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

  const calculatedTotal =
    estimate.items.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.totalPrice ??
            0
        ),
      0
    );

  const grandTotal =
    estimate.estimatedTotal !=
      null
      ? Number(
          estimate.estimatedTotal
        )
      : calculatedTotal;

  return (
    <main className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl bg-white p-8 shadow print:max-w-none print:p-0 print:shadow-none md:p-10">

        {/* ==========================================
            BUSINESS HEADER
        ========================================== */}
        <header className="border-b-2 border-blue-900 pb-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex items-center gap-4">
              <img
                src="/products/deeglobalgh-logo.png"
                alt="DeeglobalGh"
                className="h-24 w-auto"
              />

              <div>
                <h1 className="text-3xl font-extrabold text-blue-900">
                  DeeglobalGh
                </h1>

                <p className="mt-1 text-sm text-gray-700">
                  Kasoa, New Market
                </p>

                <p className="mt-1 text-sm font-medium text-yellow-600">
                  Educational Books
                  {" • "}
                  School Supplies
                  {" • "}
                  Exam Essentials
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <h2 className="text-2xl font-extrabold uppercase tracking-wide text-gray-900">
                Quotation
              </h2>

              <p className="mt-1 text-sm font-semibold text-gray-600">
                Proforma Invoice
              </p>

              <div className="mt-4 space-y-1 text-sm text-gray-700">
                <div>
                  <strong>
                    Estimate No:
                  </strong>{" "}
                  {estimate.estimateNumber}
                </div>

                <div>
                  <strong>
                    Date:
                  </strong>{" "}
                  {formatDate(
                    estimate.createdAt
                  )}
                </div>

                <div>
                  <strong>
                    Status:
                  </strong>{" "}
                  {estimate.status}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ==========================================
            CUSTOMER DETAILS
        ========================================== */}
        <section className="mt-7 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-gray-50 p-5 print:bg-white">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-900">
              Quotation For
            </h3>

            <div className="space-y-2 text-sm text-gray-800">
              <div>
                <strong>
                  Customer:
                </strong>{" "}
                {estimate.customerName}
              </div>

              <div>
                <strong>
                  Phone:
                </strong>{" "}
                {estimate.phone}
              </div>

              {estimate.email && (
                <div>
                  <strong>
                    Email:
                  </strong>{" "}
                  {estimate.email}
                </div>
              )}

              {estimate.schoolName && (
                <div>
                  <strong>
                    School / Organisation:
                  </strong>{" "}
                  {estimate.schoolName}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 p-5 print:bg-white">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-900">
              Reference Details
            </h3>

            <div className="space-y-2 text-sm text-gray-800">
              {estimate.className && (
                <div>
                  <strong>
                    Class:
                  </strong>{" "}
                  {estimate.className}
                </div>
              )}

              {estimate.academicYear && (
                <div>
                  <strong>
                    Academic Year:
                  </strong>{" "}
                  {estimate.academicYear}
                </div>
              )}

              <div>
                <strong>
                  Source:
                </strong>{" "}
                {estimate.source}
              </div>

              <div>
                <strong>
                  Priority:
                </strong>{" "}
                {estimate.priority}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            ITEMS TABLE
        ========================================== */}
        <section className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Quotation Items
          </h3>

          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-blue-900 text-white print:bg-gray-100 print:text-black">
                <tr>
                  <th className="px-4 py-3 text-left">
                    #
                  </th>

                  <th className="px-4 py-3 text-left">
                    Description
                  </th>

                  <th className="px-4 py-3 text-right">
                    Qty
                  </th>

                  <th className="px-4 py-3 text-right">
                    Unit Price
                  </th>

                  <th className="px-4 py-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {estimate.items.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No quotation items have been added.
                    </td>
                  </tr>
                ) : (
                  estimate.items.map(
                    (
                      item
                    ) => {
                      const unitPrice =
                        Number(
                          item.unitPrice ??
                            0
                        );

                      const totalPrice =
                        Number(
                          item.totalPrice ??
                            0
                        );

                      return (
                        <tr
                          key={
                            item.id
                          }
                          className="border-t"
                        >
                          <td className="px-4 py-3 align-top">
                            {
                              item.lineNumber
                            }
                          </td>

                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-gray-900">
                              {item.product
                                ?.name ??
                                item.description}
                            </div>

                            {item.product
                              ?.sku && (
                              <div className="mt-1 text-xs text-gray-500">
                                SKU:{" "}
                                {
                                  item.product
                                    .sku
                                }
                              </div>
                            )}

                            {item.product &&
                              item.description !==
                                item.product
                                  .name && (
                                <div className="mt-1 text-xs text-gray-500">
                                  Requested
                                  as:{" "}
                                  {
                                    item.description
                                  }
                                </div>
                              )}
                          </td>

                          <td className="px-4 py-3 text-right align-top">
                            {
                              item.quantity
                            }
                          </td>

                          <td className="px-4 py-3 text-right align-top">
                            GHS{" "}
                            {formatMoney(
                              unitPrice
                            )}
                          </td>

                          <td className="px-4 py-3 text-right align-top font-semibold">
                            GHS{" "}
                            {formatMoney(
                              totalPrice
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ==========================================
            TOTAL
        ========================================== */}
        <section className="mt-6 flex justify-end">
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between border-b py-3 text-sm">
              <span>
                Subtotal
              </span>

              <span className="font-semibold">
                GHS{" "}
                {formatMoney(
                  grandTotal
                )}
              </span>
            </div>

            <div className="flex items-center justify-between border-b-2 border-blue-900 py-4 text-xl font-extrabold text-blue-900">
              <span>
                Total
              </span>

              <span>
                GHS{" "}
                {formatMoney(
                  grandTotal
                )}
              </span>
            </div>
          </div>
        </section>

        {/* ==========================================
            NOTES
        ========================================== */}
        {estimate.notes && (
          <section className="mt-8 rounded-xl border bg-yellow-50 p-5 print:bg-white">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              Notes
            </h3>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {estimate.notes}
            </p>
          </section>
        )}

        {/* ==========================================
            TERMS
        ========================================== */}
        <section className="mt-8 text-sm leading-6 text-gray-700">
          <h3 className="font-bold text-gray-900">
            Quotation Notes
          </h3>

          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Prices and product availability are subject to confirmation at the time of order.
            </li>

            <li>
              This quotation does not constitute proof of payment.
            </li>

            <li>
              Delivery charges, where applicable, will be confirmed separately.
            </li>

            <li>
              Bulk and wholesale pricing may vary according to quantity and current stock.
            </li>
          </ul>
        </section>

        {/* ==========================================
            BUSINESS CONTACTS
        ========================================== */}
        <footer className="mt-10 border-t pt-6">
          <h3 className="text-lg font-bold text-blue-900">
            DeeglobalGh
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Educational Books • School Supplies • Exam Essentials
          </p>

          <div className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
            <div>
              <strong>
                WhatsApp:
              </strong>{" "}
              027 003 0000
            </div>

            <div>
              <strong>
                Customer Care:
              </strong>{" "}
              0246 011 773
            </div>

            <div>
              <strong>
                Shop Line:
              </strong>{" "}
              030 398 2358
            </div>
          </div>

          <p className="mt-5 text-xs text-gray-500">
            Thank you for requesting a quotation from DeeglobalGh.
          </p>
        </footer>

        {/* ==========================================
            ADMIN ACTIONS
        ========================================== */}
        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <PrintQuotationButton />

          <Link
            href={`/admin/estimator/${estimate.id}`}
            className="rounded border px-5 py-2 font-semibold hover:bg-gray-50"
          >
            Back to Estimate
          </Link>
        </div>
      </div>
    </main>
  );
}
