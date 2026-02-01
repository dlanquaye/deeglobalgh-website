import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("dg_admin");

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  await prisma.order.update({
  where: { id: orderId },
  data: { paymentStatus: "DELIVERING" },
});


  return NextResponse.json({ ok: true });
}
