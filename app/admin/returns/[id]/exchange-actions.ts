"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";
import { revalidatePath } from "next/cache";

export async function processExchange(
  returnId: string,
  replacementProductId: string
) {
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

  if (returnRequest.status === "EXCHANGED") {
  throw new Error("This return has already been exchanged.");
}

  const replacementProduct = await prisma.product.findUnique({
  where: {
    id: replacementProductId,
  },
});

if (!replacementProduct) {
  throw new Error("Replacement product not found");
}

const branchInventory = await prisma.inventory.findFirst({
  where: {
    productId: replacementProductId,
    locationType: "BRANCH",
    locationId: returnRequest.branchId,
  },
});

if (!branchInventory || branchInventory.quantity < 1) {
  throw new Error("Replacement product is out of stock");
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

  await tx.inventory.update({
    where: {
      id: branchInventory.id,
    },
    data: {
      quantity: {
        decrement: 1,
      },
    },
  });

  await tx.inventoryMovement.create({
    data: {
      productId: replacementProductId,
      quantity: 1,
      type: "SALE",
      note: `Exchange Replacement - ${returnRequest.returnNumber}`,
      orderId: returnRequest.orderId,
    },
  });

  await tx.inventoryMovement.create({
    data: {
      productId: returnedItem.productId,
      quantity: returnedItem.quantity,
      type: "RETURN",
      note: `Exchange Return - ${returnRequest.returnNumber}`,
      orderId: returnRequest.orderId,
    },
  });

  await tx.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "EXCHANGED",
      completedAt: new Date(),
    },
  });
});

  revalidatePath(`/admin/returns/${returnId}`);
}