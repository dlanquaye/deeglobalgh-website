import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const closings = await prisma.dailyClosing.findMany({
      orderBy: {
        businessDate: "desc",
      },
      include: {
        branch: true,
        closedByStaff: true,
        expenses: true,
        purchases: true,
        bankDeposits: true,
      },
    });

    
    return NextResponse.json(closings);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch daily closings" },
      { status: 500 }
    );
  }
  
}
const BRANCH_ID = "cmq4b407s0000g3jg31elgm80";
const STAFF_ID = "cmq4b407s0000g3jg31elgm80";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      businessDate,
      openingFloat,
      
      actualCash,
      varianceReason,
    } = body;

    const closingDate = new Date(businessDate);

const today = new Date();
today.setHours(23, 59, 59, 999);

if (closingDate > today) {
  return NextResponse.json(
    {
      error: "Future business dates are not allowed",
    },
    { status: 400 }
  );
}

    const existingClosing =
  await prisma.dailyClosing.findFirst({
    where: {
      branchId: BRANCH_ID,
      businessDate: new Date(businessDate),
    },
  });

if (existingClosing) {
  return NextResponse.json(
    {
      error:
        "Daily closing already exists for this business date",
    },
    { status: 400 }
  );
}

const startOfDay = new Date(businessDate);
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date(businessDate);
endOfDay.setHours(23, 59, 59, 999);

const cashSales = await prisma.order.aggregate({
  _sum: {
    amount: true,
  },
  where: {
    paymentMethod: "Cash",
    status: "COMPLETED",
    createdAt: {
  gte: startOfDay,
  lte: endOfDay,
},
  },
});

const expectedCash =
  Number(openingFloat) +
  Number(cashSales._sum.amount ?? 0);

    const variance =
  Number(actualCash) - expectedCash;

    const closing = await prisma.dailyClosing.create({
      data: {
        businessDate: new Date(businessDate),

        openingFloat,
        expectedCash,
        actualCash,
        variance,

        varianceReason,

        branchId: BRANCH_ID,
        closedByStaffId: STAFF_ID,
      },
    });

    return NextResponse.json({
  ...closing,
  expectedCash,
  variance,
});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create daily closing" },
      { status: 500 }
    );
  }
}