"use client";

export default function PublicReceiptClient({
  order,
}: {
  order: any;
}) {
  const total =
    order.amount + (order.deliveryFee ?? 0);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

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
              Educational Books • School Supplies • Exam Essentials
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-extrabold">
          Order Receipt
        </h2>
      </div>

      <p>
        <strong>Customer:</strong>{" "}
        {order.customerName || "N/A"}
      </p>

      <p>
        <strong>Payment Method:</strong>{" "}
        {order.paymentMethod || "N/A"}
      </p>

      <p>
        <strong>Order ID:</strong> {order.orderId}
      </p>

      <p>
        <strong>Date:</strong>{" "}
        {new Date(order.createdAt).toLocaleString()}
      </p>

      <hr className="my-4" />

      <h3 className="mb-3 text-lg font-bold">
        Items Purchased
      </h3>

      <div className="space-y-3">
        {order.orderItems?.map((item: any) => (
          <div
            key={item.id}
            className="rounded border p-3"
          >
            <div className="font-semibold">
              {item.product?.name}
            </div>

            <div className="text-sm text-gray-600">
              SKU: {item.product?.sku}
            </div>

            <div>Qty: {item.quantity}</div>

            <div>
              Unit Price: GHS{" "}
              {formatMoney(item.unitPrice)}
            </div>

            <div className="font-medium">
              Line Total: GHS{" "}
              {formatMoney(item.totalPrice)}
            </div>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      <div className="text-lg font-bold">
        Total: GHS {formatMoney(total)}
      </div>

      <hr className="my-6" />

      <div className="text-sm">
        <h3 className="font-bold">
          Thank You For Shopping With DeeglobalGh
        </h3>

        <p className="mt-3">
          WhatsApp Support: 0246 011 773
        </p>

        <p>
          Management Escalation: 054 113 1111
        </p>

        <p className="mt-3">
          <a
            href="https://g.page/r/Cc9a8U1h6aPlEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Leave Us a Google Review
          </a>
        </p>
      </div>
    </main>
  );
}