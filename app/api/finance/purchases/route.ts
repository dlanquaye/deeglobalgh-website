import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BRANCH_ID = "cmq4b407s0000g3jg31elgm80";
const STAFF_ID = "cmq4b407s0000g3jg31elgm80";

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        branch: true,
        enteredByStaff: true,
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      supplierName,
      amount,
      referenceNumber,
      notes,
    } = body;

    if (!supplierName) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.create({
      data: {
        supplierName,
        amount,
        referenceNumber,
        notes,
        branchId: BRANCH_ID,
        enteredByStaffId: STAFF_ID,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}