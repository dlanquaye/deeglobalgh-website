import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  notFound,
  redirect,
} from "next/navigation";
import OrderReceiptClient from "./OrderReceiptClient";

export const runtime = "nodejs";

export default async function OrderReceiptPage(
  props: {
    params: Promise<{
      id: string;
    }>;
    searchParams: Promise<{
      source?: string;
    }>;
  }
) {
  const { id } =
    await props.params;

  const { source } =
    await props.searchParams;

  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      "dg_admin"
    )?.value;

  if (!session) {
    redirect(
      "/admin/login"
    );
  }

  const order =
    await prisma.order.findFirst({
      where: {
        orderId: id,
      },

      orderBy: {
        createdAt:
          "desc",
      },

      include: {
        orderItems: {
          include: {
            product:
              true,
          },
        },

        payments: {
          orderBy: {
            createdAt:
              "asc",
          },
        },
      },
    });

  if (!order) {
    notFound();
  }

  return (
    <OrderReceiptClient
      source={source}
      order={{
        id:
          order.id,

        orderId:
          order.orderId,

        createdAt:
          order.createdAt.toISOString(),

        customerName:
          order.customerName,

        paymentMethod:
          order.paymentMethod,

        email:
          order.email,

        phone:
          order.phone,

        amount:
          order.amount,

        deliveryFee:
          order.deliveryFee,

        paymentStatus:
          order.paymentStatus,

        adminNotes:
          order.adminNotes,

        orderItems:
          order.orderItems,

        /*
         * Only serialisable payment fields are
         * passed into the client receipt.
         *
         * The client will display CONFIRMED
         * allocations only. Failed attempts
         * remain in the database audit trail
         * but will not be presented as money
         * received from the customer.
         */
        payments:
          order.payments.map(
            (
              payment
            ) => ({
              id:
                payment.id,

              method:
                payment.method,

              amountPesewas:
                payment.amountPesewas,

              status:
                payment.status,

              provider:
                payment.provider,

              providerCode:
                payment.providerCode,
            })
          ),
      }}
    />
  );
}