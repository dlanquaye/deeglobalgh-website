import { prisma } from "./prisma";
import { applyStockMovement } from "./stock";
import { LocationType } from "@prisma/client";

// ==============================
// VALIDATE STOCK (FROM CART)
// ==============================
async function validateStock(cartItems: any[]) {
  for (const item of cartItems) {
    const inventory = await prisma.inventory.findFirst({
      where: {
        productId: item.id,
        locationType: LocationType.BRANCH,
      },
    });

    const availableQty = inventory?.quantity || 0;

    if (availableQty < item.qty) {
      throw new Error(
        JSON.stringify({
          type: "STOCK_ERROR",
          message: `Only ${availableQty} items left in stock`,
          availableStock: availableQty,
          productName: item.name,
        })
      );
    }
  }
}

// ==============================
// CREATE ORDER (FROM CART)
// ==============================
export async function createOrderFromCart(
  locationId: string,
  items: any[]
) {
  await validateStock(items);

  let totalAmount = 0;

  const order = await prisma.order.create({
    data: {
      orderId: "ORD-" + Date.now(),
      email: "test@test.com",
      phone: "0000000000",
      amount: 0,
      status: "PENDING",
      locationId,
    },
  });

  for (const item of items) {
    const totalPrice = item.retailPrice * item.qty;
    totalAmount += totalPrice;

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.id, // ✅ correct
        quantity: item.qty, // ✅ correct
        unitPrice: item.retailPrice,
        totalPrice,
      },
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { amount: totalAmount },
  });

  return { order, totalAmount };
}

// ==============================
// CONFIRM ORDER (STOCK DEDUCTION)
// ==============================
export async function adminConfirmOrder(orderId: string) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found");
    if (!order.locationId) throw new Error("Missing location");

    if (order.status !== "PENDING") {
      throw new Error("Only pending orders can be confirmed");
    }

    const orderItems = await tx.orderItem.findMany({
      where: { orderId: order.id },
    });

    // ✅ CHECK STOCK (CORRECTED)
    for (const item of orderItems) {
      const inventory = await tx.inventory.findFirst({
        where: {
          productId: item.productId, // ✅ FIXED
          locationType: LocationType.BRANCH,
          locationId: order.locationId,
        },
      });

      if (!inventory || inventory.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.productId}`
        );
      }
    }

    // ✅ DEDUCT STOCK (CORRECTED)
    for (const item of orderItems) {
      const movement = await tx.stockMovement.create({
        data: {
          productId: item.productId, // ✅ FIXED
          quantity: item.quantity,
          type: "SALE",
          fromLocationType: LocationType.BRANCH, // ✅ FIXED
          fromLocationId: order.locationId,
          createdByStaffId: "DG001",
        },
      });

      await applyStockMovement(tx, movement.id);
    }

    // ✅ UPDATE STATUS
    return await tx.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    });
  });
}

// ==============================
// CANCEL ORDER (RESTORE STOCK)
// ==============================
export async function adminCancelOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Order not found");
  if (!order.locationId) throw new Error("Missing location");

  if (order.status === "CANCELLED") {
    throw new Error("Already cancelled");
  }

  if (order.status === "DELIVERED") {
    throw new Error("Delivered orders cannot be cancelled");
  }

  if (order.status === "CONFIRMED") {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    });

    for (const item of orderItems) {
      const movement = await prisma.stockMovement.create({
        data: {
          productId: item.productId, // ✅ FIXED
          quantity: item.quantity,
          type: "RETURN",
          toLocationType: LocationType.BRANCH, // ✅ FIXED (return to shop)
          toLocationId: order.locationId,
          createdByStaffId: "DG001",
        },
      });

      await applyStockMovement(prisma, movement.id);
    }
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
}

// ==============================
// WHATSAPP CHECKOUT (FINAL)
// ==============================
export async function createOrderAndWhatsAppLink(
  locationId: string,
  items: any[]
) {
  const { order, totalAmount } = await createOrderFromCart(
    locationId,
    items
  );

  // ✅ CONFIRM + DEDUCT STOCK
  await adminConfirmOrder(order.id);

  let message = `Hello, I want to place an order:\n\n`;
  message += `Order ID: ${order.orderId}\n\n`;

  for (const item of items) {
    const totalPrice = item.retailPrice * item.qty;
    message += `• ${item.name} x${item.qty} - GHS ${totalPrice}\n`;
  }

  message += `\nTotal: GHS ${totalAmount}\n\n`;
  message += `Please confirm availability and delivery.`;

  const encoded = encodeURIComponent(message);
  const link = `https://wa.me/233246011773?text=${encoded}`;

  return { order, link };
}