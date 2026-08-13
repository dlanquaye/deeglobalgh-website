"use client";

import { useState } from "react";
import PrintButton from "./PrintButton";

function formatMoney(
  amount: number
) {
  return new Intl.NumberFormat(
    "en-GH",
    {
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2,
    }
  ).format(amount);
}

function formatPaymentMethod(
  method: string | null | undefined
) {
  switch (method) {
    case "CASH":
      return "Cash";

    case "MOMO":
      return "Mobile Money";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "ONLINE_CARD":
      return "Online Card";

    case "SPLIT":
      return "Split Payment";

    case "OTHER":
      return "Other";

    default:
      return method || "N/A";
  }
}

export default function OrderReceiptClient({
  order,
  source,
}: {
  order: any;
  source?: string;
}) {
  const [
    reason,
    setReason,
  ] = useState("");

  const [
    unlocked,
    setUnlocked,
  ] = useState(
    source === "pos"
  );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const submitReason =
    async () => {
      if (
        reason.trim().length <
        5
      ) {
        setError(
          "Please provide a valid reason (min 5 characters)"
        );

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res =
          await fetch(
            "/api/admin/log-order-view",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  orderId:
                    order.orderId,

                  reason,
                }),
            }
          );

        if (!res.ok) {
          const data =
            await res.json();

          setError(
            data.error ||
              "Failed to log access"
          );

          setLoading(false);

          return;
        }

        setUnlocked(true);
      } catch {
        setError(
          "Failed to log access"
        );

        setLoading(false);
      }
    };

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-bold">
            Reason Required
          </h2>

          <p className="mb-4 text-sm text-gray-600">
            You must provide a
            reason for opening
            this order.
          </p>

          <textarea
            value={reason}
            onChange={(e) =>
              setReason(
                e.target.value
              )
            }
            className="mb-3 w-full rounded border px-3 py-2"
            rows={4}
          />

          {error && (
            <p className="mb-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={
              submitReason
            }
            disabled={
              loading
            }
            className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            {loading
              ? "Submitting..."
              : "Submit & View Order"}
          </button>
        </div>
      </main>
    );
  }

  const total =
    order.amount +
    (order.deliveryFee ??
      0);

  // ==========================================
  // CONFIRMED PAYMENT BREAKDOWN
  // ==========================================
  //
  // Failed, cancelled and pending payment
  // attempts remain in the database audit
  // history but must never be shown on the
  // customer receipt as money received.
  // ==========================================
    type ReceiptPayment = {
    method?: string | null;
    amountPesewas?: number | null;
    status?: string | null;
  };

  const receiptPayments:
    ReceiptPayment[] =
    Array.isArray(
      order.payments
    )
      ? (order.payments as ReceiptPayment[])
      : [];

  const confirmedPayments =
    receiptPayments.filter(
      (payment) =>
        payment.status ===
        "CONFIRMED"
    );

  /*
   * Group only CONFIRMED allocations.
   *
   * Failed, pending and cancelled attempts stay
   * in the database audit trail but are never
   * displayed as customer money received.
   */
  const paymentTotals:
    Record<string, number> =
    {};

  for (
    const payment of
    confirmedPayments
  ) {
    const method =
      payment.method ??
      "OTHER";

    const amountPesewas =
      payment.amountPesewas ??
      0;

    paymentTotals[method] =
      (paymentTotals[
        method
      ] ?? 0) +
      amountPesewas;
  }

  const paymentBreakdown =
    Object.entries(
      paymentTotals
    ).filter(
      (
        [, amountPesewas]
      ) =>
        amountPesewas >
        0
    );

  const showPaymentBreakdown =
    order.paymentMethod ===
      "SPLIT" &&
    paymentBreakdown.length >
      0;

  return (
    <main className="mx-auto max-w-2xl bg-white p-8 print:p-0">
      <div className="mb-6 border-b pb-6">
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

            <p className="text-sm text-gray-700">
              Kasoa, New Market
            </p>

            <p className="text-sm font-medium text-yellow-600">
              Educational Books
              {" • "}
              School Supplies
              {" • "}
              Exam Essentials
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-extrabold">
          Order Receipt
        </h2>
      </div>

      <div className="mb-4 rounded bg-green-50 p-3 text-sm print:bg-white">
        <div>
          <strong>
            Customer:
          </strong>{" "}
          {order.customerName ||
            "N/A"}
        </div>

        <div>
          <strong>
            Payment Method:
          </strong>{" "}
          {formatPaymentMethod(
            order.paymentMethod
          )}
        </div>

        {showPaymentBreakdown && (
          <div className="mt-3 border-t border-green-200 pt-3">
            <div className="mb-2 font-semibold">
              Payment Breakdown
            </div>

            <div className="space-y-1">
              {paymentBreakdown.map(
                ([
                  method,
                  amountPesewas,
                ]) => (
                  <div
                    key={
                      method
                    }
                    className="flex justify-between gap-4"
                  >
                    <span>
                      {formatPaymentMethod(
                        method
                      )}
                    </span>

                    <span className="font-medium">
                      GHS{" "}
                      {formatMoney(
                        amountPesewas /
                          100
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <strong>
            Order ID:
          </strong>{" "}
          {order.orderId}
        </div>

        <div>
          <strong>
            Date:
          </strong>{" "}
          {new Date(
            order.createdAt
          ).toLocaleString()}
        </div>

        <hr />

        <div>
          <strong>
            Email:
          </strong>{" "}
          {order.email}
        </div>

        <div>
          <strong>
            Phone:
          </strong>{" "}
          {order.phone}
        </div>

        <hr />

        <div>
          <strong>
            Subtotal:
          </strong>{" "}
          GHS{" "}
          {formatMoney(
            order.amount
          )}
        </div>

        {order.deliveryFee !==
          null && (
          <div>
            <strong>
              Delivery Fee:
            </strong>{" "}
            GHS{" "}
            {formatMoney(
              order.deliveryFee
            )}
          </div>
        )}

        <div className="text-lg font-bold">
          Total: GHS{" "}
          {formatMoney(
            total
          )}
        </div>

        <hr />

        <h2 className="mb-3 mt-4 text-lg font-bold">
          Items Purchased
        </h2>

        <div className="space-y-3">
          {order.orderItems?.map(
            (
              item: any
            ) => (
              <div
                key={
                  item.id
                }
                className="rounded border p-3"
              >
                <div className="font-semibold">
                  {
                    item.product
                      ?.name
                  }
                </div>

                <div className="text-sm text-gray-600">
                  SKU:{" "}
                  {
                    item.product
                      ?.sku
                  }
                </div>

                <div>
                  Qty:{" "}
                  {
                    item.quantity
                  }
                </div>

                <div>
                  Unit Price:
                  {" "}
                  GHS{" "}
                  {formatMoney(
                    item.unitPrice
                  )}
                </div>

                <div className="font-medium">
                  Line Total:
                  {" "}
                  GHS{" "}
                  {formatMoney(
                    item.totalPrice
                  )}
                </div>
              </div>
            )
          )}
        </div>

        <hr />

        <div>
          <strong>
            Status:
          </strong>{" "}
          {
            order.paymentStatus
          }
        </div>

        {order.adminNotes && (
          <div>
            <strong>
              Admin Notes:
            </strong>

            <div className="mt-1 whitespace-pre-wrap">
              {
                order.adminNotes
              }
            </div>
          </div>
        )}
      </div>

      <hr className="mt-8" />

      <div className="mt-6 text-sm">
        <h3 className="text-lg font-bold">
          Thank You For
          Shopping With
          DeeglobalGh
        </h3>

        <p className="mt-2">
          Fast delivery of
          textbooks, exam
          essentials, and
          school supplies.
        </p>

        <div className="mt-4">
          <strong>
            WhatsApp Support:
          </strong>{" "}
          0246 011 773
        </div>

        {/*
         * Management escalation contact is
         * intentionally internal and must not
         * appear on customer-facing receipts.
         */}

        <div className="mt-4">
          <a
            href="https://g.page/r/Cc9a8U1h6aPlEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Leave Us a Google
            Review
          </a>
        </div>
      </div>

      <div className="mt-8 flex gap-4 print:hidden">
        <PrintButton />

        <a
          href="/admin/db-orders"
          className="rounded border px-4 py-2"
        >
          Back to Orders
        </a>
      </div>
    </main>
  );
}