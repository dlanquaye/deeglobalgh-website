import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const MAX_TOKEN_ATTEMPTS = 3;

function createPaymentToken() {
  return randomBytes(24).toString("base64url");
}

export async function ensureOrderPaymentToken(
  orderId: string
) {
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        paymentToken: true,
        paymentStatus: true,
      },
    });

  if (!order) {
    throw new Error(
      "Order not found."
    );
  }

  if (
    order.paymentStatus === "PAID" ||
    order.paymentStatus === "DELIVERING" ||
    order.paymentStatus === "COMPLETED"
  ) {
    throw new Error(
      "A payment continuation link cannot be created for an already-paid order."
    );
  }

  if (order.paymentToken) {
    return order.paymentToken;
  }

  for (
    let attempt = 1;
    attempt <= MAX_TOKEN_ATTEMPTS;
    attempt++
  ) {
    const paymentToken =
      createPaymentToken();

    try {
      const updated =
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentToken,
          },
          select: {
            paymentToken: true,
          },
        });

      if (!updated.paymentToken) {
        throw new Error(
          "Payment token was not created."
        );
      }

      return updated.paymentToken;
    } catch (error: any) {
      const isUniqueCollision =
        error?.code === "P2002";

      if (
        !isUniqueCollision ||
        attempt === MAX_TOKEN_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    "Unable to create payment continuation token."
  );
}
