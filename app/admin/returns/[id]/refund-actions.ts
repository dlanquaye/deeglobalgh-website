"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function processRefund(
  returnId: string
) {
  await requireAdmin();

  const returnRequest =
    await prisma.returnRequest.findUnique({
      where: {
        id: returnId,
      },

      include: {
        items: true,
        order: true,
        branch: true,
      },
    });

  if (!returnRequest) {
    throw new Error(
      "Return not found"
    );
  }

  const refundMethod =
    returnRequest.order.paymentMethod;

  if (!refundMethod) {
    throw new Error(
      "Original payment method not found."
    );
  }

  if (
    returnRequest.status ===
    "REFUNDED"
  ) {
    throw new Error(
      "This return has already been refunded."
    );
  }

  if (
    returnRequest.status ===
    "EXCHANGED"
  ) {
    throw new Error(
      "This return has already been exchanged."
    );
  }

  if (
    returnRequest.status !==
    "APPROVED"
  ) {
    throw new Error(
      "This return must be approved before a refund can be processed."
    );
  }

  if (
    returnRequest.items.length ===
    0
  ) {
    throw new Error(
      "No returned items found"
    );
  }

  await prisma.$transaction(
    async (tx) => {
      for (
        const returnedItem of
        returnRequest.items
      ) {
        const returnedInventory =
          await tx.inventory.findUnique({
            where: {
              productId_locationType_locationId:
                {
                  productId:
                    returnedItem.productId,

                  locationType:
                    "BRANCH",

                  locationId:
                    returnRequest.branchId,
                },
            },
          });

        if (!returnedInventory) {
          throw new Error(
            `Returned product inventory not found for product ${returnedItem.productId}`
          );
        }

        const updatedInventory =
          await tx.inventory.update({
            where: {
              id:
                returnedInventory.id,
            },

            data: {
              quantity: {
                increment:
                  returnedItem.quantity,
              },
            },

            select: {
              quantity: true,
            },
          });

        /*
         * Inventory is authoritative.
         *
         * Product.stockQty is maintained as a
         * compatibility mirror because parts of
         * the existing application still display
         * or consume it.
         */
        await tx.product.update({
          where: {
            id:
              returnedItem.productId,
          },

          data: {
            stockQty:
              updatedInventory.quantity,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId:
              returnedItem.productId,

            quantity:
              returnedItem.quantity,

            type:
              "RETURN",

            note:
              `Refund - ${returnRequest.returnNumber}`,

            orderId:
              returnRequest.orderId,
          },
        });
      }

      await tx.returnRequest.update({
        where: {
          id: returnId,
        },

        data: {
          status:
            "REFUNDED",

          completedAt:
            new Date(),
        },
      });
    }
  );

  revalidatePath(
    `/admin/returns/${returnId}`
  );
}
