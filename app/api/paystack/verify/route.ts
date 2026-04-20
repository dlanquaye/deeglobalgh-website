export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PaymentStatus, InventoryMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderSMS } from "@/app/lib/hubtelSms";

export async function GET(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    /* ===============================
       VERIFY PAYMENT WITH PAYSTACK
    =============================== */
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        cache: "no-store",
      }
    );

    const result = await res.json();

    if (!res.ok || !result?.data) {
      return NextResponse.json(
        { error: "Paystack verification failed" },
        { status: 500 }
      );
    }

    const paystackData = result.data;

    const orderId = paystackData?.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID missing from metadata" },
        { status: 400 }
      );
    }

    /* ===============================
       FIND ORDER + ITEMS + PRODUCT
    =============================== */
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: {
        orderItems: {
          include: {
            product: true, // ✅ VERY IMPORTANT
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ===============================
       ALREADY PROCESSED → EXIT
    =============================== */
    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({
        ok: true,
        orderId,
        paymentStatus: PaymentStatus.PAID,
      });
    }

    /* ===============================
       CHECK PAYMENT STATUS
    =============================== */
    if (paystackData.status !== "success") {
      await prisma.order.update({
        where: { orderId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          reference,
        },
      });

      return NextResponse.json({
        ok: true,
        orderId,
        paymentStatus: PaymentStatus.FAILED,
      });
    }

    /* ===============================
       STOCK + ORDER UPDATE
    =============================== */
    await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            locationId: order.locationId!,
          },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(
            `Stock inconsistency for ${item.product?.name || item.productId}`
          );
        }

        await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            locationId: order.locationId!,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: InventoryMovementType.SALE,
            quantity: -item.quantity,
            note: `Online Order ${order.orderId} - ${reference}`,
          },
        });
      }

      // ✅ IMPORTANT FIX (use update, not updateMany)
      await tx.order.update({
        where: { orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          reference,
        },
      });
    });

    /* ===============================
       SEND SMS (FIXED)
    =============================== */
    try {
      if (!order.smsSent && order.phone) {
        const message = `DeeGlobalGH:

Payment received successfully ✅

Order ID: ${order.orderId}
Amount: GHS ${order.amount.toFixed(2)}

We are processing your order and will contact you shortly.

Thank you for shopping with us.`;

        await sendOrderSMS({
          phone: order.phone,
          message,
        });

        await prisma.order.update({
          where: { orderId },
          data: { smsSent: true },
        });
      }
    } catch (smsError) {
      console.error("SMS failed:", smsError);
    }

    return NextResponse.json({
      ok: true,
      orderId,
      paymentStatus: PaymentStatus.PAID,
    });

  } catch (err: any) {
    console.error("❌ Paystack verify error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}