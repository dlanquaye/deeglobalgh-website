import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const inventory = await prisma.inventory.findFirst({
    where: {
      productId: body.productId,
      locationType: body.locationType,
    },
  });

  console.log("INVENTORY FOUND", inventory);

  if (!inventory) {
    return NextResponse.json(
      {
        success: false,
        message: "Inventory record not found",
      },
      { status: 404 }
    );
  }

  const currentStock = inventory.quantity;

  const newStock = currentStock + Number(body.quantity);

  if (newStock < 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Adjustment would create negative stock",
      },
      { status: 400 }
    );
  }

  await prisma.inventory.update({
    where: {
      id: inventory.id,
    },
    data: {
      quantity: newStock,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: body.productId,
      type: "ADJUSTMENT",
      quantity: Number(body.quantity),

      fromLocationType: body.locationType,
      fromLocationId: inventory.locationId,

      createdByStaffId: "ADMIN",

      status: "COMPLETED",
    },
  });

  return NextResponse.json({
    success: true,
    message: `Stock updated from ${currentStock} to ${newStock}`,
  });
}