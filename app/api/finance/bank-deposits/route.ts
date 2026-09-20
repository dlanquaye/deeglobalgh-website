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

  /*
   * Normal managers may only work
   * against their own assigned branch.
   */
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
    isSuperAdmin,
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
          "You do not have permission to manage bank deposits.",
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
          "You do not have permission to manage bank deposits for this branch.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

export async function GET() {
  try {
    const {
      session,
    } =
      await requireFinanceManager();

    const deposits =
      await prisma.bankDeposit.findMany({
        where: {
          branchId:
            session.branchId!,
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
      });

    return NextResponse.json(
      deposits
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
      "Bank deposit loading error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch bank deposits.",
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

    const bankName =
      typeof record.bankName ===
        "string"
        ? record.bankName.trim()
        : "";

    const amount =
      Number(
        record.amount
      );

    const referenceNumber =
      typeof record.referenceNumber ===
        "string" &&
      record.referenceNumber.trim()
        ? record.referenceNumber.trim()
        : null;

    const depositMethod =
      typeof record.depositMethod ===
        "string"
        ? record.depositMethod.trim()
        : "";

    const notes =
      typeof record.notes ===
        "string" &&
      record.notes.trim()
        ? record.notes.trim()
        : null;

    if (!bankName) {
      return NextResponse.json(
        {
          error:
            "Bank name is required.",
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

    if (!depositMethod) {
      return NextResponse.json(
        {
          error:
            "Deposit method is required.",
        },
        {
          status: 400,
        }
      );
    }

    const deposit =
      await prisma.bankDeposit.create({
        data: {
          bankName,
          amount,
          referenceNumber,
          depositMethod,
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
      deposit
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
      "Bank deposit creation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create bank deposit.",
      },
      {
        status: 500,
      }
    );
  }
}
