import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BRANCH_ID = "cmq4b407s0000g3jg31elgm80";

// Replace with your actual Manager Staff ID
const STAFF_ID = "cmq4b407s0000g3jg31elgm80";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        branch: true,
        enteredByStaff: true,
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { expenseType, amount, notes } = body;

    if (!expenseType) {
      return NextResponse.json(
        { error: "Expense type is required" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    if (!notes) {
      return NextResponse.json(
        { error: "Notes are required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        expenseType,
        amount,
        notes,
        branchId: BRANCH_ID,
        enteredByStaffId: STAFF_ID,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}