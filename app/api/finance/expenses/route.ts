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

async function requireFinanceManager() {
  const session =
    (await requireAdmin()) as AdminSession;

  if (!session.staffId) {
    throw new Error(
      "StaffAccountRequired"
    );
  }

  const staff =
    await prisma.staff.findUnique({
      where: {
        id: session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        branchId: true,
      },
    });

  if (
    !staff ||
    !staff.isActive
  ) {
    throw new Error(
      "InactiveStaff"
    );
  }

  const isSuperAdmin =
    session.role ===
      "SUPER_ADMIN" ||
    staff.role ===
      "SUPER_ADMIN";

  const canManageFinance =
    isSuperAdmin ||
    staff.role ===
      "MANAGER";

  if (!canManageFinance) {
    throw new Error(
      "FinanceManagementForbidden"
    );
  }

  if (!session.branchId) {
    throw new Error(
      "BranchRequired"
    );
  }

  if (
    !isSuperAdmin &&
    staff.branchId !==
      session.branchId
  ) {
    throw new Error(
      "BranchFinanceForbidden"
    );
  }

  return {
    session,
    staff,
  };
}

function authErrorResponse(
  error: unknown
) {
  if (!(error instanceof Error)) {
    return null;
  }

  if (
    error.message ===
    "Unauthorized"
  ) {
    return NextResponse.json(
      {
        error:
          "Authentication required.",
      },
      {
        status: 401,
      }
    );
  }

  if (
    error.message ===
    "CredentialChangeRequired"
  ) {
    return NextResponse.json(
      {
        error:
          "Credential change required.",
      },
      {
        status: 403,
      }
    );
  }

  if (
    error.message ===
      "StaffAccountRequired" ||
    error.message ===
      "InactiveStaff"
  ) {
    return NextResponse.json(
      {
        error:
          "An active linked staff account is required.",
      },
      {
        status: 403,
      }
    );
  }

  if (
    error.message ===
    "FinanceManagementForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to manage expenses.",
      },
      {
        status: 403,
      }
    );
  }

  if (
    error.message ===
    "BranchRequired"
  ) {
    return NextResponse.json(
      {
        error:
          "Your staff account is not assigned to a branch.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    error.message ===
    "BranchFinanceForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to manage expenses for this branch.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

export async function GET(
  req: Request
) {
  try {
    const {
      session,
    } =
      await requireFinanceManager();

    const {
      searchParams,
    } =
      new URL(req.url);

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
            "Invalid business date.",
        },
        {
          status: 400,
        }
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
            session.branchId!,
          ...dateFilter,
        },

        orderBy: {
          createdAt:
            "desc",
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
            session.branchId!,
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
    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "Expense loading error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch expenses.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    const {
      session,
      staff,
    } =
      await requireFinanceManager();

    let body: unknown;

    try {
      body =
        await req.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !==
        "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const record =
      body as Record<
        string,
        unknown
      >;

    const expenseType =
      typeof record.expenseType ===
        "string"
        ? record.expenseType.trim()
        : "";

    const notes =
      typeof record.notes ===
        "string"
        ? record.notes.trim()
        : "";

    const amount =
      Number(
        record.amount
      );

    if (!expenseType) {
      return NextResponse.json(
        {
          error:
            "Expense type is required.",
        },
        {
          status: 400,
        }
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
            "Amount must be greater than zero.",
        },
        {
          status: 400,
        }
      );
    }

    if (!notes) {
      return NextResponse.json(
        {
          error:
            "Notes are required.",
        },
        {
          status: 400,
        }
      );
    }

    const expense =
      await prisma.expense.create({
        data: {
          expenseType,
          amount,
          notes,

          branchId:
            session.branchId!,

          enteredByStaffId:
            staff.id,
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
    const authResponse =
      authErrorResponse(
        error
      );

    if (authResponse) {
      return authResponse;
    }

    console.error(
      "Expense creation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create expense.",
      },
      {
        status: 500,
      }
    );
  }
}
