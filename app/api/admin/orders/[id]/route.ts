import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ FIX HERE

    const body = await req.json();
    const { status } = body;

    console.log("ID:", id);
    console.log("STATUS:", status);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("PATCH ERROR FULL:", error);

    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}