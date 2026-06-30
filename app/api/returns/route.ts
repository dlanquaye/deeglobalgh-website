import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const returns = await prisma.returnRequest.findMany({
    include: {
      order: true,
      branch: true,
      requestedByStaff: true,
      approvedByStaff: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(returns);
}