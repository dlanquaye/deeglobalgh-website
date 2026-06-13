import { prisma } from "@/lib/prisma";
import { LocationType, MovementType } from "@prisma/client";

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
}: TransferInventoryInput){
  const sourceInventory = await prisma.inventory.findFirst({
    where: {
      productId,
      locationId: fromLocationId,
    },
  });

  if (!sourceInventory) {
    throw new Error("Source inventory record not found");
  }
  if (quantity <= 0) {
  throw new Error("Transfer quantity must be greater than zero");
}

if (sourceInventory.quantity < quantity) {
  throw new Error("Insufficient stock at source location");
}
const destinationInventory = await prisma.inventory.findFirst({
  where: {
    productId,
    locationId: toLocationId,
  },
});

let destinationRecord = destinationInventory;

if (!destinationRecord) {
  destinationRecord = await prisma.inventory.create({
    data: {
      productId,
      locationId: toLocationId,
      locationType: toLocationType,
      quantity: 0,
    },
  });
}
return await prisma.$transaction(async (tx) => {
  await tx.inventory.update({
    where: {
      id: sourceInventory.id,
    },
    data: {
      quantity: {
        decrement: quantity,
      },
    },
  });

  await tx.inventory.update({
    where: {
      id: destinationRecord.id,
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
    type: MovementType.TRANSFER,
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
  fromLocationId,
  toLocationId,
};
});
}
