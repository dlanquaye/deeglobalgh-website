export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { orderId, customer, items } = body;

    /* ===============================
       🧾 BASIC VALIDATION
    =============================== */
    if (
      !orderId ||
      !customer ||
      !customer.email ||
      !customer.phone ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    /* ===============================
       🔒 PREVENT DUPLICATE ORDER ID
    =============================== */
    const existingOrder = await prisma.order.findUnique({
      where: { orderId },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: "Order already exists" },
        { status: 400 }
      );
    }

    /* ===============================
       📦 FETCH PRODUCTS FROM DB
    =============================== */
    const skus = items.map((i: any) => i.productId);

    const products = await prisma.product.findMany({
      where: { sku: { in: skus } },
    });

    /* ===============================
       🔒 STOCK VALIDATION
    =============================== */
    for (const item of items) {
      const product = products.find(
        (p) => p.sku === item.productId
      );

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      if (product.stockQty < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    /* ===============================
       💰 CALCULATE TOTAL FROM DB
    =============================== */
    let totalAmount = 0;

    const preparedItems = items.map((item: any) => {
      const product = products.find(
        (p) => p.sku === item.productId
      )!;

      const unitPrice = product.retailPrice;
      const totalPrice = unitPrice * item.quantity;

      totalAmount += totalPrice;

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    /* ===============================
       🔐 ATOMIC TRANSACTION
    =============================== */
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderId,
          reference: orderId,
          email: customer.email,
          phone: customer.phone,
          amount: Math.round(totalAmount),
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      for (const item of preparedItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      amount: result.amount,
    });
  } catch (err: any) {
    console.error("❌ Order creation failed:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}