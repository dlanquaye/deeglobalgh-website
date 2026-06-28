import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyStockMovement } from "@/lib/stock";
import { LocationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

const {
  items,
  customerName,
  customerPhone,
  paymentMethod,
} = body;

if (!items || items.length === 0) {
  return NextResponse.json(
    { error: "No items provided" },
    { status: 400 }
  );
}

const result = await prisma.$transaction(async (tx) => {
  const productIds = items.map((item: any) => item.id);

const products = await tx.product.findMany({
  where: {
    id: {
      in: productIds,
    },
  },
});

const productMap = new Map(
  products.map((product) => [product.id, product])
);

  // Validate branch inventory first
for (const item of items) {
  const product = productMap.get(item.id);

  if (!product) {
    throw new Error(`Product not found`);
  }

  const inventory = await tx.inventory.findFirst({
    where: {
      productId: item.id,
      locationType: LocationType.BRANCH,
      locationId: "cmq4b407s0000g3jg31elgm80",
    },
  });

  const availableQty = inventory?.quantity || 0;

  if (availableQty < item.quantity) {
    throw new Error(
      `Not enough stock for ${product.name}. Available: ${availableQty}`
    );
  }
}

  // Calculate total
  let total = 0;

  for (const item of items) {
    const product = productMap.get(item.id);

    if (!product) continue;

    total += product.retailPrice * item.quantity;
  }

  // Create order
  const order = await tx.order.create({
    data: {
      orderId: `POS-${Date.now()}`,
      email: "pos@shop.com",

      phone: customerPhone || "0000000000",
      customerName: customerName || null,
      paymentMethod: paymentMethod || "Cash",

      amount: Math.round(total),
      paymentStatus: "PAID",
      
      locationId: "cmq4b407s0000g3jg31elgm80",
    },
  });

  // Process each item
  for (const item of items) {
    const product = productMap.get(item.id);

    if (!product) continue;

    // Deduct stock
    await tx.product.update({
      where: { id: item.id },
      data: {
        stockQty: product.stockQty - item.quantity,
      },
    });

    // Create order item
    await tx.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.retailPrice,
        totalPrice:
         product.retailPrice * item.quantity,
       },
     });

    // Inventory movement
    const movement = await tx.stockMovement.create({
  data: {
    productId: product.id,
    quantity: item.quantity,
    type: "SALE",
    fromLocationType: LocationType.BRANCH,
    fromLocationId: "cmq4b407s0000g3jg31elgm80",
    createdByStaffId: "DG001",
  },
});

await applyStockMovement(tx, movement.id);
  }

  return order;
});

return NextResponse.json({
  success: true,
  orderId: result.orderId,
});

  } catch (error) {
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}