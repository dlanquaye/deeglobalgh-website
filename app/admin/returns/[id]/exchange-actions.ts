"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function processExchange(
  returnId: string,
  replacementProductId: string,
  replacementQuantity = 1
) {
  await requireAdmin();

  if (!replacementProductId) {
    throw new Error(
      "Replacement product is required."
    );
  }

  if (
    !Number.isInteger(replacementQuantity) ||
    replacementQuantity <= 0
  ) {
    throw new Error(
      "Replacement quantity must be a positive whole number."
    );
  }

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

  if (
    returnRequest.status !==
    "APPROVED"
  ) {
    throw new Error(
      "This return must be approved before an exchange can be processed."
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

  const replacementProduct =
    await prisma.product.findUnique({
      where: {
        id: replacementProductId,
      },

      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

  if (!replacementProduct) {
    throw new Error(
      "Replacement product not found"
    );
  }

  if (!replacementProduct.isActive) {
    throw new Error(
      "Replacement product is inactive"
    );
  }

  const returningSameProduct =
    returnRequest.items.some(
      (item) =>
        item.productId ===
        replacementProductId
    );

  if (returningSameProduct) {
    throw new Error(
      "Replacement product must be different from the returned product."
    );
  }

  await prisma.$transaction(
    async (tx) => {
      /*
       * Protect replacement stock atomically.
       *
       * updateMany + quantity >= requested quantity
       * prevents concurrent exchanges from driving
       * branch inventory negative.
       */
      const replacementDecrement =
        await tx.inventory.updateMany({
          where: {
            productId:
              replacementProductId,

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
                  replacementProductId,

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
          "Replacement product inventory not found"
        );
      }

      await tx.product.update({
        where: {
          id:
            replacementProductId,
        },

        data: {
          stockQty:
            replacementInventory.quantity,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          productId:
            replacementProductId,

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
       * Every returned line must be restored.
       *
       * The previous implementation processed
       * only items[0], which could leave a
       * multi-item exchange partially restored.
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
          });

        if (!returnedInventory) {
          throw new Error(
            `Returned product inventory not found for product ${returnedItem.productId}`
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

      await tx.returnRequest.update({
        where: {
          id: returnId,
        },

        data: {
          status:
            "EXCHANGED",

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
