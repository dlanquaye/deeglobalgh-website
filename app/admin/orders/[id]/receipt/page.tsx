import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import PrintButton from "./PrintButton";

export const runtime = "nodejs";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export default async function OrderReceiptPage(props: {
  params: Promise<{ id: string }>;
}) {
  /* ===============================
     🔓 UNWRAP ASYNC PARAMS (NEXT 15)
     =============================== */
  const { id } = await props.params;

  /* ===============================
     🔒 ADMIN AUTH CHECK
     =============================== */
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("dg_admin")?.value;

  if (!isAdmin) {
    redirect("/admin/login");
  }

  /* ===============================
     🔎 LOAD ORDER (DETERMINISTIC)
     =============================== */
  const order = await prisma.order.findFirst({
    where: {
      orderId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!order) {
    notFound();
  }

  const total = order.amount + (order.deliveryFee ?? 0);

  return (
    <main className="mx-auto max-w-2xl bg-white p-8 print:p-0">
      <h1 className="mb-6 text-2xl font-extrabold">
        Order Receipt
      </h1>

      <div className="space-y-4 text-sm">
        <div>
          <strong>Order ID:</strong> {order.orderId}
        </div>

        <div>
          <strong>Date:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </div>

        <hr />

        <div>
          <strong>Email:</strong> {order.email}
        </div>

        <div>
          <strong>Phone:</strong> {order.phone}
        </div>

        <hr />

        <div>
          <strong>Subtotal:</strong> GHS {formatMoney(order.amount)}
        </div>

        {order.deliveryFee !== null && (
          <div>
            <strong>Delivery Fee:</strong>{" "}
            GHS {formatMoney(order.deliveryFee)}
          </div>
        )}

        <div className="text-lg font-bold">
          Total: GHS {formatMoney(total)}
        </div>

        <hr />

        <div>
          <strong>Status:</strong> {order.paymentStatus}
        </div>

        {order.adminNotes && (
          <div>
            <strong>Admin Notes:</strong>
            <div className="mt-1 whitespace-pre-wrap">
              {order.adminNotes}
            </div>
          </div>
        )}
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
