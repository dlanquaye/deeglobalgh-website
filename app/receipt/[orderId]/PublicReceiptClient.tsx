"use client";

type ReceiptPayment = {
  method?: string | null;
  amountPesewas?: number | null;
  status?: string | null;
};

function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "en-GH",
    {
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2,
    }
  ).format(value);
}

function formatPaymentMethod(
  method:
    | string
    | null
    | undefined
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

export default function PublicReceiptClient({
  order,
}: {
  order: any;
}) {
  const total =
    order.amount +
    (order.deliveryFee ??
      0);

  // ==========================================
  // CONFIRMED PAYMENT BREAKDOWN
  // ==========================================
  //
  // Failed, pending and cancelled payment
  // attempts remain in the audit trail but
  // must never appear on the customer's
  // receipt as money received.
  // ==========================================
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
    <main className="mx-auto max-w-2xl bg-white p-8">
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

      <div className="rounded bg-green-50 p-3 text-sm">
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

      <div className="mt-4 space-y-2 text-sm">
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
      </div>

      <hr className="my-4" />

      <h3 className="mb-3 text-lg font-bold">
        Items Purchased
      </h3>

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

      <hr className="my-4" />

      <div className="text-lg font-bold">
        Total: GHS{" "}
        {formatMoney(
          total
        )}
      </div>

      <hr className="my-6" />

      <div className="text-sm">
        <h3 className="font-bold">
          Thank You For
          Shopping With
          DeeglobalGh
        </h3>

        <p className="mt-3">
          <strong>
            WhatsApp:
          </strong>{" "}
          027 003 0000
        </p>

        <p>
          <strong>
            Customer Care Calls:
          </strong>{" "}
          0246 011 773
        </p>

        <p>
          <strong>
            Shop Line:
          </strong>{" "}
          030 398 2358
        </p>

        {/*
         * Management escalation contact is
         * intentionally internal and must not
         * appear on customer-facing receipts.
         */}

        <p className="mt-3">
          <a
            href="https://g.page/r/Cc9a8U1h6aPlEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Leave Us a Google
            Review
          </a>
        </p>
      </div>
    </main>
  );
}