import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get("reference")

  if (!reference) {
    return NextResponse.json({ error: "No reference provided" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { reference }
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json(order)
}