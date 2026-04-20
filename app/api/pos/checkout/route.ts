import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found` },
          { status: 404 }
        );
      }

      if (product.stockQty < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${product.name}` },
          { status: 400 }
        );
      }

      // ✅ Deduct stock
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stockQty: product.stockQty - item.quantity,
        },
      });

      // 🚫 Inventory movement temporarily disabled
      // await prisma.inventoryMovement.create({
      //   data: {
      //     productId: item.id,
      //     quantity: -item.quantity,
      //     type: "SALE",
      //   },
      // });
    }

    // 💰 Calculate total
const total = items.reduce(
  (sum: number, item: any) =>
    sum + item.quantity * (item.retailPrice || 0),
  0
);

// 🧾 Create Order
const order = await prisma.order.create({
  data: {
    orderId: `POS-${Date.now()}`, // simple unique ID
    email: "pos@shop.com",        // temporary
    phone: "0000000000",          // temporary
    amount: Math.round(total),    // must be Int
    paymentStatus: "PAID",
  },
});

// 🧾 Save order items
for (const item of items) {
  const product = await prisma.product.findUnique({
    where: { id: item.id },
  });

  if (!product) continue;

  await prisma.orderItem.create({
  data: {
    orderId: order.id,
    productId: product.id,
    quantity: item.quantity,
    unitPrice: product.retailPrice,
    totalPrice: product.retailPrice * item.quantity,
  },
});
}

return NextResponse.json({
  success: true,
  orderId: order.id,
});

  } catch (error) {
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}