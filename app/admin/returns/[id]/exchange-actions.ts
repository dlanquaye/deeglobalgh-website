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

  const canProcessExchange =
    isSuperAdmin ||
    staff.role ===
      "MANAGER";

  if (!canProcessExchange) {
    throw new Error(
      "You do not have permission to process exchanges."
    );
  }

  return {
    session,
    staff,
    isSuperAdmin,
  };
}

export async function processExchange(
  returnId: string,
  replacementProductId: string,
  replacementQuantity = 1
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

  const cleanReplacementProductId =
    String(
      replacementProductId ?? ""
    ).trim();

  if (!cleanReturnId) {
    throw new Error(
      "Return ID is required."
    );
  }

  if (!cleanReplacementProductId) {
    throw new Error(
      "Replacement product is required."
    );
  }

  if (
    !Number.isInteger(
      replacementQuantity
    ) ||
    replacementQuantity <= 0
  ) {
    throw new Error(
      "Replacement quantity must be a positive whole number."
    );
  }

  /*
   * Load the return first for authorisation
   * and business validation.
   */
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
      "You do not have permission to process exchanges for this branch."
    );
  }

  if (
    returnRequest.type !==
    "EXCHANGE"
  ) {
    throw new Error(
      "This return request is not an exchange."
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
    returnRequest.status ===
    "REFUNDED"
  ) {
    throw new Error(
      "This return has already been refunded."
    );
  }

  /*
   * The hardened workflow is:
   *
   * PENDING
   *   -> APPROVED
   *   -> INSPECTED
   *   -> EXCHANGED
   *
   * Exchange cannot bypass inspection.
   */
  if (
    returnRequest.status !==
    "INSPECTED"
  ) {
    throw new Error(
      "This return must be inspected before an exchange can be processed."
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

  const replacementProduct =
    await prisma.product.findUnique({
      where: {
        id:
          cleanReplacementProductId,
      },

      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

  if (!replacementProduct) {
    throw new Error(
      "Replacement product not found."
    );
  }

  if (
    !replacementProduct.isActive
  ) {
    throw new Error(
      "Replacement product is inactive."
    );
  }

  const returningSameProduct =
    returnRequest.items.some(
      (item) =>
        item.productId ===
        cleanReplacementProductId
    );

  if (returningSameProduct) {
    throw new Error(
      "Replacement product must be different from the returned product."
    );
  }

  await prisma.$transaction(
    async (tx) => {
      /*
       * Atomically claim this return for
       * exchange processing.
       *
       * If another request already changed
       * its status, count will be zero and
       * no inventory changes will occur.
       *
       * Because this status change is inside
       * the same transaction, any later stock
       * failure rolls it back automatically.
       */
      const claimedReturn =
        await tx.returnRequest.updateMany({
          where: {
            id:
              cleanReturnId,

            type:
              "EXCHANGE",

            status:
              "INSPECTED",
          },

          data: {
            status:
              "EXCHANGED",

            completedAt:
              new Date(),
          },
        });

      if (
        claimedReturn.count !==
        1
      ) {
        throw new Error(
          "This return is no longer available for exchange processing."
        );
      }

      /*
       * Protect replacement stock atomically.
       *
       * updateMany + quantity >= requested
       * prevents concurrent operations from
       * driving branch inventory negative.
       */
      const replacementDecrement =
        await tx.inventory.updateMany({
          where: {
            productId:
              cleanReplacementProductId,

            locationType:
              "BRANCH",

            locationId:
              returnRequest.branchId,

            quantity: {
              gte:
                replacementQuantity,
            },
          },

          data: {
            quantity: {
              decrement:
                replacementQuantity,
            },
          },
        });

      if (
        replacementDecrement.count !==
        1
      ) {
        throw new Error(
          `Not enough stock for ${replacementProduct.name}.`
        );
      }

      const replacementInventory =
        await tx.inventory.findUnique({
          where: {
            productId_locationType_locationId:
              {
                productId:
                  cleanReplacementProductId,

                locationType:
                  "BRANCH",

                locationId:
                  returnRequest.branchId,
              },
          },

          select: {
            quantity: true,
          },
        });

      if (!replacementInventory) {
        throw new Error(
          "Replacement product inventory not found."
        );
      }

      await tx.product.update({
        where: {
          id:
            cleanReplacementProductId,
        },

        data: {
          stockQty:
            replacementInventory.quantity,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          productId:
            cleanReplacementProductId,

          quantity:
            replacementQuantity,

          type:
            "SALE",

          note:
            `Exchange Replacement - ${returnRequest.returnNumber}`,

          orderId:
            returnRequest.orderId,
        },
      });

      /*
       * Restore every returned line.
       *
       * This preserves the existing hardened
       * multi-item return behaviour.
       */
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

        const updatedReturnedInventory =
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

        await tx.product.update({
          where: {
            id:
              returnedItem.productId,
          },

          data: {
            stockQty:
              updatedReturnedInventory.quantity,
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
              `Exchange Return - ${returnRequest.returnNumber}`,

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
