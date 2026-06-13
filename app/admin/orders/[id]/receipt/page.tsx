import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import OrderReceiptClient from "./OrderReceiptClient";

export const runtime = "nodejs";

export default async function OrderReceiptPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const cookieStore = await cookies();
  const session = cookieStore.get("dg_admin")?.value;

  if (!session) {
    redirect("/admin/login");
  }

  const order = await prisma.order.findFirst({
  where: { orderId: id },
  orderBy: { createdAt: "desc" },
  include: {
    orderItems: {
      include: {
        product: true,
      },
    },
  },
});

  if (!order) {
    notFound();
  }

  console.log(
  "RECEIPT DATA:",
  JSON.stringify(
    {
      customerName: order.customerName,
      paymentMethod: order.paymentMethod,
      orderItems: order.orderItems,
    },
    null,
    2
  )
);

  return (
    <OrderReceiptClient
  order={{
    id: order.id,
    orderId: order.orderId,
    createdAt: order.createdAt.toISOString(),

    customerName: order.customerName,
    paymentMethod: order.paymentMethod,

    email: order.email,
    phone: order.phone,

    amount: order.amount,
    deliveryFee: order.deliveryFee,

    paymentStatus: order.paymentStatus,
    adminNotes: order.adminNotes,

    orderItems: order.orderItems,
  }}
/>
  );
}