import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

function getBusinessDateRange(
  businessDate: string | null
) {
  if (!businessDate) {
    return {
      startOfDay: null,
      endOfDay: null,
    };
  }

  const startOfDay =
    new Date(businessDate);

  const endOfDay =
    new Date(businessDate);

  if (
    Number.isNaN(
      startOfDay.getTime()
    ) ||
    Number.isNaN(
      endOfDay.getTime()
    )
  ) {
    return {
      startOfDay: null,
      endOfDay: null,
    };
  }

  startOfDay.setHours(
    0,
    0,
    0,
    0
  );

  endOfDay.setHours(
    23,
    59,
    59,
    999
  );

  return {
    startOfDay,
    endOfDay,
  };
}

export async function GET(
  req: Request
) {
  try {
    const session =
      (await requireAdmin()) as AdminSession;

    if (!session.staffId) {
      return NextResponse.json(
        {
          error:
            "Your admin account is not linked to a staff record.",
        },
        { status: 401 }
      );
    }

    if (!session.branchId) {
      return NextResponse.json(
        {
          error:
            "Your staff account is not assigned to a branch.",
        },
        { status: 400 }
      );
    }

    const {
      searchParams,
    } = new URL(req.url);

    const businessDate =
      searchParams.get(
        "businessDate"
      );

    const {
      startOfDay,
      endOfDay,
    } =
      getBusinessDateRange(
        businessDate
      );

    if (
      businessDate &&
      (!startOfDay ||
        !endOfDay)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid business date",
        },
        { status: 400 }
      );
    }

    const dateFilter =
      startOfDay &&
      endOfDay
        ? {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          }
        : {};

    const [
      expenses,
      expenseTotals,
    ] = await Promise.all([
      prisma.expense.findMany({
        where: {
          branchId:
            session.branchId,
          ...dateFilter,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          branch: true,
          enteredByStaff:
            true,
        },
      }),

      prisma.expense.aggregate({
        where: {
          branchId:
            session.branchId,
          ...dateFilter,
        },

        _sum: {
          amount: true,
        },
      }),
    ]);

    return NextResponse.json({
      expenses,
      expenseTotals,
    });
  } catch (error) {
    console.error(
      "Expense loading error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
      "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to fetch expenses",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    const session =
      (await requireAdmin()) as AdminSession;

    if (!session.staffId) {
      return NextResponse.json(
        {
          error:
            "Your admin account is not linked to a staff record.",
        },
        { status: 401 }
      );
    }

    if (!session.branchId) {
      return NextResponse.json(
        {
          error:
            "Your staff account is not assigned to a branch.",
        },
        { status: 400 }
      );
    }

    const body =
      await req.json();

    const expenseType =
      typeof body?.expenseType ===
      "string"
        ? body.expenseType.trim()
        : "";

    const notes =
      typeof body?.notes ===
      "string"
        ? body.notes.trim()
        : "";

    const amount =
      Number(body?.amount);

    if (!expenseType) {
      return NextResponse.json(
        {
          error:
            "Expense type is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Amount must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (!notes) {
      return NextResponse.json(
        {
          error:
            "Notes are required",
        },
        { status: 400 }
      );
    }

    const expense =
      await prisma.expense.create({
        data: {
          expenseType,
          amount,
          notes,

          branchId:
            session.branchId,

          enteredByStaffId:
            session.staffId,
        },

        include: {
          branch: true,
          enteredByStaff:
            true,
        },
      });

    return NextResponse.json(
      expense
    );
  } catch (error) {
    console.error(
      "Expense creation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
      "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to create expense",
      },
      { status: 500 }
    );
  }
}
