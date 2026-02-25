import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updated);
}