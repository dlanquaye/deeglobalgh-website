import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BRANCH_ID = "cmq4b407s0000g3jg31elgm80";
const STAFF_ID = "cmq4b407s0000g3jg31elgm80";

export async function GET() {
  try {
    const deposits = await prisma.bankDeposit.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        branch: true,
        enteredByStaff: true,
      },
    });

    return NextResponse.json(deposits);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch bank deposits" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      bankName,
      amount,
      referenceNumber,
      depositMethod,
      notes,
    } = body;

    if (!bankName) {
      return NextResponse.json(
        { error: "Bank name is required" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    if (!depositMethod) {
      return NextResponse.json(
        { error: "Deposit method is required" },
        { status: 400 }
      );
    }

    const deposit = await prisma.bankDeposit.create({
      data: {
        bankName,
        amount,
        referenceNumber,
        depositMethod,
        notes,
        branchId: BRANCH_ID,
        enteredByStaffId: STAFF_ID,
      },
    });

    return NextResponse.json(deposit);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create bank deposit" },
      { status: 500 }
    );
  }
}