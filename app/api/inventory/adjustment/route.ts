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

const currentStock = inventory?.quantity ?? 0;

const newStock =
  currentStock + Number(body.quantity);
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
    id: inventory!.id,
  },
  data: {
    quantity: newStock,
  },
});

return NextResponse.json({
  success: true,
  message: `Stock updated from ${currentStock} to ${newStock}`,
});
}