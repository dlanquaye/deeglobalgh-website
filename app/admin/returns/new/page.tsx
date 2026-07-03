import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createReturnRequest } from "../actions";

type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function NewReturnPage({ searchParams }: Props) {
  const { order } = await searchParams;

  if (!order) {
  notFound();
}

const dbOrder = await prisma.order.findUnique({
  where: {
    id: order,
  },
  include: {
    orderItems: {
      include: {
        product: true,
      },
    },
  },
});

if (!dbOrder) {
  notFound();
}

 return (
  <form action={createReturnRequest} className="p-6">
    <input
  type="hidden"
  name="orderId"
  value={dbOrder.id}
/>
      <h1 className="text-2xl font-bold">Create Return Request</h1>

      <div className="mt-6 mb-6">
  <label className="block font-medium mb-2">
    Return Type
  </label>

  <div className="mt-2 flex gap-8">
  <label className="flex items-center gap-2">
    <input
      type="radio"
      name="returnType"
      value="REFUND"
      defaultChecked
    />
    Refund
  </label>

  <label className="flex items-center gap-2">
    <input
      type="radio"
      name="returnType"
      value="EXCHANGE"
    />
    Exchange
  </label>
</div>

  <div className="mb-6">
  <label className="block font-medium mb-2">
    Customer Reason
  </label>

  <textarea
  name="customerReason"
  rows={3}
  className="w-full rounded border p-3"
  placeholder="Enter the customer's reason for the return..."
/>
</div>
</div>

      <h2 className="mt-6 mb-4 border-b pb-2 text-xl font-bold text-gray-800">
  Order Details
</h2>

<div className="mt-2 rounded-lg border bg-gray-50 p-4">
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

    <div className="flex items-center gap-3">
  <span className="w-28 font-semibold">Order No.</span>
  <span className="font-medium text-gray-700">
    {dbOrder.orderId}
  </span>
</div>

    <div>
      <span className="font-semibold">Status:</span><br />
      {dbOrder.paymentStatus}
    </div>

    <div>
      <span className="font-semibold">Phone:</span><br />
      {dbOrder.phone}
    </div>

    <div>
      <span className="font-semibold">Payment Method:</span><br />
      {dbOrder.paymentMethod}
    </div>

    <div>
      <span className="font-semibold">Order Total:</span><br />
      GH₵ {dbOrder.amount.toFixed(2)}
    </div>

    <div>
      <span className="font-semibold">Order Date:</span><br />
      {new Date(dbOrder.createdAt).toLocaleDateString("en-GB")}
    </div>

  </div>
</div>

<div className="mt-6 rounded-lg border p-4">
  <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-800">
  Order Items
</h2>

  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b bg-gray-100">
        <th className="p-2 text-center">Select</th>
        <th className="p-2 text-left">Product</th>
        <th className="p-2 text-center">Purchased</th>
        <th className="p-2 text-center">Returning</th>
        <th className="p-2 text-left">Condition</th>
      </tr>
    </thead>

    <tbody>
      {dbOrder.orderItems.map((item) => (
        <tr key={item.id} className="border-b">
          <td className="p-2 text-center">
            <input
  type="checkbox"
  name={`selected-${item.id}`}
  value="true"
/>
          </td>

          <td className="p-2">
            <div className="font-medium">
              {item.product.name}
            </div>
          </td>

          <td className="p-2 text-center">
            {item.quantity}
          </td>

          <td className="p-2 text-center">
            <input
  type="number"
  name={`quantity-${item.id}`}
  min={1}
  max={item.quantity}
  defaultValue={1}
  className="w-16 rounded border p-1 text-center"
/>
          </td>

          <td className="p-2">
            <select
  name={`condition-${item.id}`}
  className="rounded border p-1"
>
              <option value="GOOD">Good</option>
              <option value="DAMAGED">Damaged</option>
              <option value="DEFECTIVE">Defective</option>
              <option value="OPENED">Opened</option>
            </select>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <hr className="my-6" />

  <div className="mt-6 flex w-full justify-end">
  <button
    type="submit"
    className="rounded bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700"
  >
    Submit Return Request
  </button>
</div>
</div>
</form>

)}
