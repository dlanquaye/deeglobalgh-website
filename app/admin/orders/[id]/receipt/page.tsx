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

        /*
         * The receipt needs the immutable
         * discount audit snapshot so the
         * customer can see:
         *
         * original retail value
         * discount/savings
         * final amount actually paid
         */
        discount:
          true,
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

        /*
         * amount remains available only for
         * backwards compatibility.
         *
         * amountPesewas is authoritative for
         * exact new POS totals such as GHS 4.75.
         */
        amount:
          order.amount,

        amountPesewas:
          order.amountPesewas,

        deliveryFee:
          order.deliveryFee,

        paymentStatus:
          order.paymentStatus,

        adminNotes:
          order.adminNotes,

        orderItems:
          order.orderItems,

        /*
         * Only serialisable discount fields are
         * passed into the client.
         *
         * No manager PIN or credentials are ever
         * stored or exposed here.
         */
        discount:
          order.discount
            ? {
                type:
                  order.discount.type,

                value:
                  order.discount.value,

                reason:
                  order.discount.reason,

                note:
                  order.discount.note,

                originalSubtotal:
                  order.discount.originalSubtotal,

                discountAmount:
                  order.discount.discountAmount,

                finalSubtotal:
                  order.discount.finalSubtotal,

                requestedByName:
                  order.discount.requestedByName,

                requestedByRole:
                  order.discount.requestedByRole,

                approvalRequired:
                  order.discount.approvalRequired,

                approvedByName:
                  order.discount.approvedByName,

                approvedByRole:
                  order.discount.approvedByRole,

                approvedAt:
                  order.discount.approvedAt
                    ?.toISOString() ??
                  null,
              }
            : null,

        /*
         * Only serialisable payment fields are
         * passed into the client receipt.
         *
         * The client displays CONFIRMED
         * allocations only. Failed attempts
         * remain in the database audit trail
         * but are not shown as money received.
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