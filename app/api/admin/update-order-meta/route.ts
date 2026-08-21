import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PaymentStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";

export const runtime =
  "nodejs";

function toPesewas(
  amountGhs: number
) {
  return Math.round(
    amountGhs * 100
  );
}

export async function POST(
  req: NextRequest
) {
  try {
    /*
     * ==========================================
     * ADMIN AUTH
     * ==========================================
     */
    await requireAdmin();

    const body =
      await req.json();

    const orderId =
      typeof body.orderId ===
      "string"
        ? body.orderId.trim()
        : typeof body.reference ===
            "string"
          ? body.reference.trim()
          : "";

    if (!orderId) {
      return NextResponse.json(
        {
          error:
            "Missing order identifier",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * LOAD ORDER + STORED ITEMS
     * ==========================================
     */
    const order =
      await prisma.order.findUnique({
        where: {
          orderId,
        },

        include: {
          orderItems: {
            select: {
              totalPrice: true,
            },
          },
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ==========================================
     * FINANCIAL LOCK
     * ==========================================
     *
     * Once payment is confirmed or fulfilment
     * has begun, delivery/total values are no
     * longer editable.
     */
    const isFinanciallyLocked =
      order.paymentStatus ===
        PaymentStatus.PAID ||
      order.paymentStatus ===
        PaymentStatus.DELIVERING ||
      order.paymentStatus ===
        PaymentStatus.COMPLETED;

    const hasDeliveryFee =
      Object.prototype.hasOwnProperty.call(
        body,
        "deliveryFee"
      );

    if (
      isFinanciallyLocked &&
      hasDeliveryFee
    ) {
      return NextResponse.json(
        {
          error:
            "Delivery fee cannot be modified after payment is confirmed",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * ==========================================
     * PREPARE UPDATE
     * ==========================================
     */
    const updateData: {
      deliveryFee?:
        number | null;
      adminNotes?:
        string | null;
      amount?:
        number;
      amountPesewas?:
        number;
    } = {};

    /*
     * Admin notes remain editable regardless
     * of payment state.
     */
    if (
      typeof body.adminNotes ===
      "string"
    ) {
      const notes =
        body.adminNotes.trim();

      updateData.adminNotes =
        notes || null;
    }

    /*
     * ==========================================
     * DELIVERY FEE + TOTAL RECALCULATION
     * ==========================================
     */
    if (
      !isFinanciallyLocked &&
      hasDeliveryFee
    ) {
      const deliveryFee =
        body.deliveryFee;

      if (
        typeof deliveryFee !==
          "number" ||
        !Number.isFinite(
          deliveryFee
        ) ||
        deliveryFee < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Delivery fee must be zero or a positive amount",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Stored OrderItem totals are authoritative
       * for the merchandise value of this already
       * created pending order.
       */
      const merchandisePesewas =
        order.orderItems.reduce(
          (
            total,
            item
          ) => {
            const itemTotal =
              Number(
                item.totalPrice
              );

            if (
              !Number.isFinite(
                itemTotal
              ) ||
              itemTotal < 0
            ) {
              throw new Error(
                "Order contains an invalid item total"
              );
            }

            return (
              total +
              toPesewas(
                itemTotal
              )
            );
          },
          0
        );

      const deliveryFeePesewas =
        toPesewas(
          deliveryFee
        );

      const totalAmountPesewas =
        merchandisePesewas +
        deliveryFeePesewas;

      if (
        totalAmountPesewas <=
        0
      ) {
        return NextResponse.json(
          {
            error:
              "Order total must be greater than zero",
          },
          {
            status: 400,
          }
        );
      }

      updateData.deliveryFee =
        deliveryFee;

      updateData.amountPesewas =
        totalAmountPesewas;

      /*
       * Legacy compatibility field.
       * Modern payment logic uses amountPesewas.
       */
      updateData.amount =
        Math.round(
          totalAmountPesewas /
            100
        );
    }

    const updatedOrder =
      await prisma.order.update({
        where: {
          id:
            order.id,
        },

        data:
          updateData,

        select: {
          orderId: true,
          deliveryFee: true,
          amount: true,
          amountPesewas: true,
          adminNotes: true,
          paymentStatus: true,
        },
      });

    return NextResponse.json({
      success: true,
      order:
        updatedOrder,
    });
  } catch (error) {
    console.error(
      "update-order-meta error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
            Error
            ? error.message
            : "Failed to update order meta",
      },
      {
        status: 500,
      }
    );
  }
}
