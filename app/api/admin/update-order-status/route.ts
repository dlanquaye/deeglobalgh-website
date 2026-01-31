export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { sendOrderSMS } from "@/app/lib/hubtelSms";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const allowedStatuses: PaymentStatus[] = [
      PaymentStatus.PENDING,
      PaymentStatus.PAID,
      PaymentStatus.DELIVERING,
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Only act if status is changing
    if (order.paymentStatus !== status) {
      await prisma.order.update({
        where: { orderId },
        data: { paymentStatus: status },
      });

      let message = "";

      if (status === PaymentStatus.DELIVERING) {
        message =
          "DeeglobalGh: Your order is on the way 🚚. Thank you for shopping with us.";
      }

      if (status === PaymentStatus.COMPLETED) {
        message =
          "DeeglobalGh: Your order has been delivered successfully ✅. We appreciate your business.";
      }

      if (message && order.phone) {
        try {
          await sendOrderSMS({
            phone: order.phone,
            message,
          });
        } catch {
          // Never block order updates because SMS failed
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
