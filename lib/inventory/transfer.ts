import {
  LocationType,
  MovementType,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

type TransferInventoryInput = {
  productId: string;

  fromLocationId: string;
  fromLocationType: LocationType;

  toLocationId: string;
  toLocationType: LocationType;

  quantity: number;
  createdByStaffId: string;
};

export async function transferInventory({
  productId,
  fromLocationId,
  fromLocationType,
  toLocationId,
  toLocationType,
  quantity,
  createdByStaffId,
}: TransferInventoryInput) {
  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Transfer quantity must be a positive whole number"
    );
  }

  if (
    fromLocationType ===
      toLocationType &&
    fromLocationId ===
      toLocationId
  ) {
    throw new Error(
      "Source and destination locations must be different"
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const sourceInventory =
        await tx.inventory.findUnique({
          where: {
            productId_locationType_locationId:
              {
                productId,
                locationType:
                  fromLocationType,
                locationId:
                  fromLocationId,
              },
          },
          select: {
            id: true,
            quantity: true,
          },
        });

      if (!sourceInventory) {
        throw new Error(
          "Source inventory record not found"
        );
      }

      const sourceDeduction =
        await tx.inventory.updateMany({
          where: {
            id: sourceInventory.id,
            quantity: {
              gte: quantity,
            },
          },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });

      if (
        sourceDeduction.count !== 1
      ) {
        throw new Error(
          "Insufficient stock at source location"
        );
      }

      const destinationInventory =
        await tx.inventory.upsert({
          where: {
            productId_locationType_locationId:
              {
                productId,
                locationType:
                  toLocationType,
                locationId:
                  toLocationId,
              },
          },
          update: {
            quantity: {
              increment: quantity,
            },
          },
          create: {
            productId,
            locationType:
              toLocationType,
            locationId:
              toLocationId,
            quantity,
          },
          select: {
            id: true,
            quantity: true,
          },
        });

      if (
        toLocationType ===
        LocationType.BRANCH
      ) {
        await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            stockQty:
              destinationInventory.quantity,
          },
        });
      }

      if (
        fromLocationType ===
          LocationType.BRANCH &&
        toLocationType !==
          LocationType.BRANCH
      ) {
        const remainingBranchInventory =
          await tx.inventory.findUnique({
            where: {
              productId_locationType_locationId:
                {
                  productId,
                  locationType:
                    fromLocationType,
                  locationId:
                    fromLocationId,
                },
            },
            select: {
              quantity: true,
            },
          });

        await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            stockQty:
              remainingBranchInventory
                ?.quantity ?? 0,
          },
        });
      }

      const movement =
        await tx.stockMovement.create({
          data: {
            productId,
            type:
              MovementType.TRANSFER,
            quantity,

            fromLocationType,
            fromLocationId,

            toLocationType,
            toLocationId,

            createdByStaffId,
            status: "COMPLETED",
          },
        });

      return {
        success: true,
        productId,
        quantity,
        fromLocationType,
        fromLocationId,
        toLocationType,
        toLocationId,
        sourceQuantityAfter:
          sourceInventory.quantity -
          quantity,
        destinationQuantityAfter:
          destinationInventory.quantity,
        movementId:
          movement.id,
      };
    }
  );
}
