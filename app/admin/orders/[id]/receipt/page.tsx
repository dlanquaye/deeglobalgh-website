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
  });

  if (!order) {
    notFound();
  }

  return (
    <OrderReceiptClient
      order={{
        id: order.id,
        orderId: order.orderId,
        createdAt: order.createdAt.toISOString(),
        email: order.email,
        phone: order.phone,
        amount: order.amount,
        deliveryFee: order.deliveryFee,
        paymentStatus: order.paymentStatus,
        adminNotes: order.adminNotes,
      }}
    />
  );
}