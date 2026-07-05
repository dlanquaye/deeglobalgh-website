import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";
import { saveInspection } from "./inspection-actions";
import { approveReturn, rejectReturn } from "./approval-actions";
import { processExchange } from "./exchange-actions";
import { processRefund } from "./refund-actions";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReturnDetailsPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;

  const returnRequest = await prisma.returnRequest.findUnique({
    where: {
      id,
    },
    include: {
  branch: true,
  requestedByStaff: true,
  approvedByStaff: true,

  order: true,

  items: {
    include: {
      product: true,
      orderItem: true,
    },
  },
}
  });

  const branchInventory = await prisma.inventory.findMany({
  where: {
    locationType: "BRANCH",
    locationId: returnRequest!.branchId,
    quantity: {
      gt: 0,
    },
  
  },
});

const products = await prisma.product.findMany({
  where: {
    isActive: true,
  },
  orderBy: {
    name: "asc",
  },
});
console.log("Products:", products.length);

  if (!returnRequest) {
    notFound();
  }

  const replacementProducts = products.filter((product) => {
  const inStock = branchInventory.some(
    (inventory) => inventory.productId === product.id
  );

  const isReturnedProduct = returnRequest.items.some(
    (item) => item.productId === product.id
  );

  return inStock && !isReturnedProduct;
});

console.log("Replacement Products:", replacementProducts.length);

  return (
  <div className="max-w-7xl mx-auto p-4 space-y-6">

    <h1 className="text-3xl font-bold">
      Return {returnRequest.returnNumber}
    </h1>

    <div className="bg-white rounded-lg border shadow-sm p-4">

      <h2 className="text-xl font-semibold mb-4">
        Return Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div>
          <p className="text-sm text-gray-500">
            Return Number
          </p>

          <p className="font-semibold">
            {returnRequest.returnNumber}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Status
          </p>

          <p className="font-semibold">
            {returnRequest.status}
          </p>
        </div>
        

        <div>
          <p className="text-sm text-gray-500">
            Type
          </p>

          <p className="font-semibold">
            {returnRequest.type}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Branch
          </p>

          <p className="font-semibold">
            {returnRequest.branch?.name ?? "N/A"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Requested By
          </p>

          <p className="font-semibold">
            {returnRequest.requestedByStaff?.name ?? "System"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Created
          </p>

          <p className="font-semibold">
            {returnRequest.createdAt.toLocaleString()}
          </p>
        </div>
        

      </div>

    </div>

    <div className="bg-white rounded-lg border shadow-sm p-4">

  <h2 className="text-xl font-semibold mb-4">
    Customer Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    <div>
      <p className="text-sm text-gray-500">
        Customer Name
      </p>

      <p className="font-semibold">
        {returnRequest.order.customerName || "Walk-in Customer"}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Phone
      </p>

      <p className="font-semibold">
        {returnRequest.order.phone}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Email
      </p>

      <p className="font-semibold">
        {returnRequest.order.email}
      </p>
    </div>

  </div>

</div>

<div className="bg-white rounded-lg border shadow-sm p-6">

  <h2 className="text-xl font-semibold mb-4">
    Original Order
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    <div>
      <p className="text-sm text-gray-500">Order Number</p>
      <p className="font-semibold">
        {returnRequest.order.orderId}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Payment Status</p>
      <p className="font-semibold">
        {returnRequest.order.paymentStatus}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Order Status</p>
      <p className="font-semibold">
        {returnRequest.order.status}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Payment Method</p>
      <p className="font-semibold">
        {returnRequest.order.paymentMethod ?? "N/A"}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Order Date</p>
      <p className="font-semibold">
        {returnRequest.order.createdAt.toLocaleString()}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Order Amount</p>
      <p className="font-semibold">
        GH₵ {returnRequest.order.amount.toFixed(2)}
      </p>
    </div>

  </div>

</div>

<div className="bg-white rounded-lg border shadow-sm p-6">

  <h2 className="text-xl font-semibold mb-4">
    Returned Items
  </h2>

  <div className="overflow-x-auto">

    <table className="min-w-full border-collapse">

      <thead>

        <tr className="border-b bg-gray-50">

          <th className="text-left p-3">Product</th>

          <th className="text-center p-3">
            Purchased
          </th>

          <th className="text-center p-3">
            Returning
          </th>

          <th className="text-left p-3">
            Condition
          </th>

          <th className="text-left p-3">
            Reason
          </th>

        </tr>

      </thead>

      <tbody>

        {returnRequest.items.map((item) => (

          <tr
            key={item.id}
            className="border-b hover:bg-gray-50"
          >

            <td className="p-3 font-medium">
              {item.product.name}
            </td>

            <td className="text-center p-3">
              {item.orderItem.quantity}
            </td>

            <td className="text-center p-3">
              {item.quantity}
            </td>

            <td className="p-3">
              {item.condition}
            </td>

            <td className="p-3">
              {item.itemReason || "-"}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>

<div className="bg-white rounded-lg border shadow-sm p-6">

  <h2 className="text-xl font-semibold mb-4">
    Inspection
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    <div>
      <p className="text-sm text-gray-500">
        Inspector
      </p>

      <p className="font-semibold">
        {returnRequest.approvedByStaff?.name ?? "Not Assigned"}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Inspection Status
      </p>

      <p className="font-semibold">
        {returnRequest.status}
      </p>
    </div>

  </div>

  <div className="mt-6">

    <label className="block text-sm font-medium mb-2">
      Inspection Notes
    </label>

    <textarea
  name="inspectionNotes"
  className="w-full border rounded-lg p-3"
  rows={5}
  placeholder="Enter inspection findings..."
/>

<form
  action={async (formData: FormData) => {
    "use server";

    const inspectionNotes =
  formData.get("inspectionNotes")?.toString() ?? "";

await saveInspection(
  returnRequest.id,
  inspectionNotes
);

  }}
>
  <div className="mt-4">
    <button
      type="submit"
      className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
    >
      Save Inspection
    </button>
  </div>
</form>


  </div>

</div>

<div className="bg-white rounded-lg border shadow-sm p-6">

  <div className="flex items-center justify-between">

    <div>

      <h2 className="text-xl font-semibold">
        Approval
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Review the inspection and decide whether to approve or reject this return.
      </p>

    </div>

    <div className="flex gap-3">

      <form
  action={async () => {
  "use server";

  await rejectReturn(
    returnRequest.id,
    "Rejected by manager"
  );
}}
>
  <button
    type="submit"
    disabled={returnRequest.status !== "INSPECTED"}
    className={`px-5 py-2 rounded-lg text-white ${
      returnRequest.status === "INSPECTED"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-gray-400 cursor-not-allowed"
    }`}
  >
    Reject Return
  </button>
</form>

      <form
  action={async () => {
    "use server";
    await approveReturn(returnRequest.id);
  }}
>
  <button
  disabled={returnRequest.status !== "INSPECTED"}
  className={`px-5 py-2 rounded-lg text-white ${
    returnRequest.status === "INSPECTED"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  Approve Return
</button>

</form>

    </div>

  </div>

</div>

{returnRequest.type === "REFUND" && (
  <div className="bg-white rounded-lg border shadow-sm p-6">
    <h2 className="text-xl font-semibold">
      Refund Processing
    </h2>

    <form action={processRefund.bind(null, returnRequest.id)}>
  <button
    type="submit"
    className="mt-4 px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
  >
    Process Refund
  </button>
</form>
  </div>
)}

{returnRequest.type === "EXCHANGE" && (
  <div className="bg-white rounded-lg border shadow-sm p-6">
    <h2 className="text-xl font-semibold">
      Exchange Processing
    </h2>
    
<form
  action={async (formData: FormData) => {
    "use server";

    const replacementProductId =
      formData.get("replacementProductId")?.toString() ?? "";

    console.log("Submitting Exchange Form");

    await processExchange(
      returnRequest.id,
      replacementProductId
    );
  }}
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    <div>
      <label className="block text-sm font-medium mb-2">
        Replacement Product
      </label>

      <select
        name="replacementProductId"
        className="w-full border rounded-lg p-3"
      >
        <option value="">
          Select replacement product...
        </option>

        {replacementProducts.map((product) => (
          <option
            key={product.id}
            value={product.id}
          >
            {product.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">
        Quantity
      </label>

      <input
        type="number"
        min={1}
        defaultValue={1}
        className="w-full border rounded-lg p-3"
      />
    </div>

  </div>

    <div className="mt-6">
    <button
      type="submit"
      className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
    >
      Process Exchange
    </button>

    
  </div>

  

</form>
<div className="mt-4">
  <form action={processRefund.bind(null, returnRequest.id)}>
    <button
      type="submit"
      className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
    >
      Process Refund
    </button>
  </form>
</div>
   </div>
)}

</div>

);
}