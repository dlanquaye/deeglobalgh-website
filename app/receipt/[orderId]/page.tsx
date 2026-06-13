import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicReceiptClient from "./PublicReceiptClient";

export const runtime = "nodejs";

export default async function PublicReceiptPage(props: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await props.params;

  const order = await prisma.order.findFirst({
    where: {
      orderId,
      paymentStatus: "PAID",
    },
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

  return (
  <PublicReceiptClient
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