import { prisma } from "@/lib/prisma";
import {
  LocationType,
  MovementType,
} from "@prisma/client";

interface ReceivePurchaseInput {
  productId: string;
  warehouseId: string;
  quantity: number;
  createdByStaffId: string;
}

export async function receivePurchase({
  productId,
  warehouseId,
  quantity,
  createdByStaffId,
}: ReceivePurchaseInput) {

    if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const warehouse = await prisma.warehouse.findUnique({
  where: {
    id: warehouseId,
  },
});

if (!warehouse) {
  throw new Error("Warehouse not found");
}

const inventory = await prisma.inventory.findFirst({
  where: {
    productId,
    locationType: LocationType.WAREHOUSE,
    locationId: warehouseId,
    
  },
});

let inventoryRecord = inventory;

if (!inventoryRecord) {
  inventoryRecord = await prisma.inventory.create({
    data: {
      productId,
      locationType: LocationType.WAREHOUSE,
      locationId: warehouseId,
      quantity: 0,
    },
  });
}

return await prisma.$transaction(async (tx) => {
  await tx.inventory.update({
    where: {
      id: inventoryRecord.id,
    },
    data: {
      quantity: {
        increment: quantity,
      },
    },
  });

  await tx.stockMovement.create({
    data: {
      productId,
      type: MovementType.PURCHASE,
      quantity,

      toLocationType: LocationType.WAREHOUSE,
      toLocationId: warehouseId,

      createdByStaffId,
      status: "COMPLETED",
    },
  });

  return {
    success: true,
    productId,
    warehouseId,
    quantity,
  };
});
}