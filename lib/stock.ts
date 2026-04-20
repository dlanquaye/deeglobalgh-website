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

  // REMOVE STOCK
  if (movement.fromLocationType && movement.fromLocationId) {
    const inventory = await db.inventory.findFirst({
      where: {
        productId: movement.productId,
        locationType: movement.fromLocationType,
        locationId: movement.fromLocationId,
      },
    });

    if (!inventory || inventory.quantity < movement.quantity) {
      throw new Error("Insufficient stock");
    }

    await db.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: inventory.quantity - movement.quantity,
      },
    });
  }

  // ADD STOCK
  if (movement.toLocationType && movement.toLocationId) {
    const inventory = await db.inventory.findFirst({
      where: {
        productId: movement.productId,
        locationType: movement.toLocationType,
        locationId: movement.toLocationId,
      },
    });

    if (inventory) {
      await db.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: inventory.quantity + movement.quantity,
        },
      });
    } else {
      await db.inventory.create({
        data: {
          productId: movement.productId,
          locationType: movement.toLocationType,
          locationId: movement.toLocationId,
          quantity: movement.quantity,
        },
      });
    }
  }
}