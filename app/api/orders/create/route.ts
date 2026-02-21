export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";

type CreateOrderItem = {
  productId: string;
  quantity: number;
};

type CreateOrderBody = {
  orderId: string;
  customer: {
    email: string;
    phone: string;
  };
  items: CreateOrderItem[];
};

export async function POST(req: Request) {
  try {
    const body: CreateOrderBody = await req.json();
    const { orderId, customer, items } = body;

    /* ===============================
       🛑 BASIC VALIDATION
    =============================== */

    if (
      !orderId ||
      !customer ||
      !customer.email ||
      !customer.phone ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      console.log("❌ INVALID ORDER DATA");
      return NextResponse.json(
        { error: "Invalid order data." },
        { status: 400 }
      );
    }

    /* ===============================
       🔎 LOAD PRODUCTS
    =============================== */

    const ids = items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
    });

    if (products.length !== ids.length) {
      console.log("❌ PRODUCT NOT FOUND");
      return NextResponse.json(
        { error: "One or more products not found." },
        { status: 404 }
      );
    }

    /* ===============================
       🔒 STOCK VALIDATION
    =============================== */

    for (const item of items) {
      const product = products.find(
        (p) => p.id === item.productId
      );

      if (!product) {
        console.log("❌ PRODUCT MISSING IN LOOP");
        return NextResponse.json(
          { error: "Product not found." },
          { status: 404 }
        );
      }

      const stockQty = product.stockQty ?? 0;

      console.log(
        "🔍 STOCK CHECK:",
        product.name,
        "Available:",
        stockQty,
        "Requested:",
        item.quantity
      );

      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid quantity." },
          { status: 400 }
        );
      }

      if (stockQty < item.quantity) {
        console.log("🚨 INSUFFICIENT STOCK TRIGGERED");

        return NextResponse.json(
          {
            error: `Only ${stockQty} unit(s) available for ${product.name}.`,
          },
          { status: 400 }
        );
      }
    }

    /* ===============================
       💰 CALCULATE TOTAL FROM DB
    =============================== */

    let totalAmount = 0;

    const preparedItems = items.map((item) => {
      const product = products.find(
        (p) => p.id === item.productId
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
       🔐 CREATE ORDER (NO STOCK DEDUCTION YET)
    =============================== */

    const order = await prisma.order.create({
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
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      });
    }

    console.log("✅ ORDER CREATED:", order.orderId);

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      amount: order.amount,
    });
  } catch (err: any) {
    console.error("❌ ORDER API CRASH:", err);

    return NextResponse.json(
      { error: err?.message || "Server error." },
      { status: 500 }
    );
  }
}
