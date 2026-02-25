import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

/* ===============================
   GET SINGLE PRODUCT
=============================== */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/* ===============================
   UPDATE PRODUCT
=============================== */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/* ===============================
   DELETE PRODUCT
=============================== */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}