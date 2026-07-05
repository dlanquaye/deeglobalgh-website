"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";
import { revalidatePath } from "next/cache";

export async function processRefund
(
  returnId: string
)
{
  const admin = await requireAdmin();
  

  const returnRequest = await prisma.returnRequest.findUnique({
    where: {
      id: returnId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      order: true,
      branch: true,
    },
  });

  if (!returnRequest) {
    throw new Error("Return not found");
  }

  const refundMethod = returnRequest.order.paymentMethod;

  // TODO (Post-MVP):
// Record refund payment method, refundedBy, and refund reference
// as part of the financial audit enhancement.

  if (!refundMethod) {
  throw new Error("Original payment method not found.");
}

  if (returnRequest.status === "REFUNDED") {
  throw new Error("This return has already been refunded.");
}

if (returnRequest.status === "EXCHANGED") {
  throw new Error("This return has already been exchanged.");
}

const returnedItem = returnRequest.items[0];

if (!returnedItem) {
  throw new Error("No returned item found");
}

const returnedInventory = await prisma.inventory.findFirst({
  where: {
    productId: returnedItem.productId,
    locationType: "BRANCH",
    locationId: returnRequest.branchId,
  },
});

if (!returnedInventory) {
  throw new Error("Returned product inventory not found");
}

await prisma.$transaction(async (tx) => {
  await tx.inventory.update({
    where: {
      id: returnedInventory.id,
    },
    data: {
      quantity: {
        increment: returnedItem.quantity,
      },
    },
  });

  

  

  await tx.inventoryMovement.create({
    data: {
      productId: returnedItem.productId,
      quantity: returnedItem.quantity,
      type: "RETURN",
      note: `Refund - ${returnRequest.returnNumber}`,
      orderId: returnRequest.orderId,
    },
  });

  await tx.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "REFUNDED",
      completedAt: new Date(),
    },
  });
});

  revalidatePath(`/admin/returns/${returnId}`);
}