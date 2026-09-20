"use server";

import {
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

async function requireReturnManager() {
  const session =
    await requireAdmin();

  if (!session.staffId) {
    throw new Error(
      "An active linked staff account is required."
    );
  }

  const staff =
    await prisma.staff.findUnique({
      where: {
        id: session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        branchId: true,
      },
    });

  if (
    !staff ||
    !staff.isActive
  ) {
    throw new Error(
      "An active staff account is required."
    );
  }

  const isSuperAdmin =
    session.role ===
      "SUPER_ADMIN" ||
    staff.role ===
      "SUPER_ADMIN";

  const canProcessRefund =
    isSuperAdmin ||
    staff.role ===
      "MANAGER";

  if (!canProcessRefund) {
    throw new Error(
      "You do not have permission to process refunds."
    );
  }

  return {
    session,
    staff,
    isSuperAdmin,
  };
}

export async function processRefund(
  returnId: string
) {
  const {
    session,
    isSuperAdmin,
  } =
    await requireReturnManager();

  const cleanReturnId =
    String(
      returnId ?? ""
    ).trim();

  if (!cleanReturnId) {
    throw new Error(
      "Return ID is required."
    );
  }

  const returnRequest =
    await prisma.returnRequest.findUnique({
      where: {
        id:
          cleanReturnId,
      },

      include: {
        items: true,

        order: {
          select: {
            id: true,
            paymentMethod: true,
          },
        },

        branch: {
          select: {
            id: true,
          },
        },
      },
    });

  if (!returnRequest) {
    throw new Error(
      "Return not found."
    );
  }

  if (
    !isSuperAdmin &&
    returnRequest.branchId !==
      session.branchId
  ) {
    throw new Error(
      "You do not have permission to process refunds for this branch."
    );
  }

  if (
    returnRequest.type !==
    "REFUND"
  ) {
    throw new Error(
      "This return request is not a refund."
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

  /*
   * Hardened lifecycle:
   *
   * PENDING
   *   -> APPROVED
   *   -> INSPECTED
   *   -> REFUNDED
   */
  if (
    returnRequest.status !==
    "INSPECTED"
  ) {
    throw new Error(
      "This return must be inspected before a refund can be processed."
    );
  }

  if (
    returnRequest.items.length ===
    0
  ) {
    throw new Error(
      "No returned items found."
    );
  }

  if (
    !returnRequest.order.paymentMethod
  ) {
    throw new Error(
      "Original payment method not found."
    );
  }

  await prisma.$transaction(
    async (tx) => {
      /*
       * Atomically claim the return.
       *
       * This prevents two simultaneous refund
       * requests from restoring the same stock
       * twice.
       *
       * Any later failure in this transaction
       * rolls this status change back.
       */
      const claimedReturn =
        await tx.returnRequest.updateMany({
          where: {
            id:
              cleanReturnId,

            type:
              "REFUND",

            status:
              "INSPECTED",
          },

          data: {
            status:
              "REFUNDED",

            completedAt:
              new Date(),
          },
        });

      if (
        claimedReturn.count !==
        1
      ) {
        throw new Error(
          "This return is no longer available for refund processing."
        );
      }

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

            select: {
              id: true,
              quantity: true,
            },
          });

        if (!returnedInventory) {
          throw new Error(
            `Returned product inventory not found for product ${returnedItem.productId}.`
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
         * Product.stockQty remains the branch
         * compatibility mirror used elsewhere
         * in the application.
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
    },
    {
      maxWait: 10_000,
      timeout: 30_000,

      isolationLevel:
        Prisma
          .TransactionIsolationLevel
          .Serializable,
    }
  );

  revalidatePath(
    `/admin/returns/${cleanReturnId}`
  );
}
