export async function applyStockMovement(
  db: any,
  movementId: string
) {
  const movement = await db.stockMovement.findUnique({
    where: { id: movementId },
  });

  if (!movement) {
    throw new Error("Movement not found");
  }

  if (!Number.isInteger(movement.quantity) || movement.quantity <= 0) {
    throw new Error("Movement quantity must be greater than zero");
  }

  // ==============================
  // REMOVE STOCK
  // ==============================
  if (movement.fromLocationType && movement.fromLocationId) {
    const inventory = await db.inventory.findFirst({
      where: {
        productId: movement.productId,
        locationType: movement.fromLocationType,
        locationId: movement.fromLocationId,
      },
      select: {
        id: true,
      },
    });

    if (!inventory) {
      throw new Error("Insufficient stock");
    }

    const deduction = await db.inventory.updateMany({
      where: {
        id: inventory.id,
        quantity: {
          gte: movement.quantity,
        },
      },
      data: {
        quantity: {
          decrement: movement.quantity,
        },
      },
    });

    if (deduction.count !== 1) {
      throw new Error("Insufficient stock");
    }
  }

  // ==============================
  // ADD STOCK
  // ==============================
  if (movement.toLocationType && movement.toLocationId) {
    await db.inventory.upsert({
      where: {
        productId_locationType_locationId: {
          productId: movement.productId,
          locationType: movement.toLocationType,
          locationId: movement.toLocationId,
        },
      },
      update: {
        quantity: {
          increment: movement.quantity,
        },
      },
      create: {
        productId: movement.productId,
        locationType: movement.toLocationType,
        locationId: movement.toLocationId,
        quantity: movement.quantity,
      },
    });
  }
}