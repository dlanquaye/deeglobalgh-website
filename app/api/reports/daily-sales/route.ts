import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { getOrderAmountGhs } from "@/lib/pos/orderMoney";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

async function requireSalesReportManager() {
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

  const canViewSalesReports =
    isSuperAdmin ||
    staff.role ===
      "MANAGER";

  if (!canViewSalesReports) {
    throw new Error(
      "SalesReportForbidden"
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
      "BranchReportForbidden"
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
    "SalesReportForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to view sales reports.",
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
    "BranchReportForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to view sales reports for this branch.",
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
      await requireSalesReportManager();

    const {
      searchParams,
    } =
      new URL(req.url);

    const reportDate =
      searchParams.get(
        "date"
      );

    if (!reportDate) {
      return NextResponse.json(
        {
          error:
            "Report date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        reportDate
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Report date must use YYYY-MM-DD format.",
        },
        {
          status: 400,
        }
      );
    }

    const startOfDay =
      new Date(
        `${reportDate}T00:00:00.000Z`
      );

    const endOfDay =
      new Date(
        `${reportDate}T23:59:59.999Z`
      );

    if (
      Number.isNaN(
        startOfDay.getTime()
      ) ||
      Number.isNaN(
        endOfDay.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid report date.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Daily sales reporting must include only
     * successfully paid orders belonging to
     * the authenticated branch.
     *
     * Failed or abandoned payment attempts may
     * remain in Order for audit/recovery, but
     * they are not revenue.
     */
    const sales =
      await prisma.order.findMany({
        where: {
          paymentStatus:
            "PAID",

          locationId:
            session.branchId!,

          createdAt: {
            gte:
              startOfDay,
            lte:
              endOfDay,
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    const totalSales =
      sales.reduce(
        (
          sum,
          sale
        ) =>
          sum +
          getOrderAmountGhs(
            sale
          ),
        0
      );

    const cashSales =
      sales
        .filter(
          (sale) =>
            sale.paymentMethod ===
            "CASH"
        )
        .reduce(
          (
            sum,
            sale
          ) =>
            sum +
            getOrderAmountGhs(
              sale
            ),
          0
        );

    const mobileMoneySales =
      sales
        .filter(
          (sale) =>
            sale.paymentMethod ===
            "MOMO"
        )
        .reduce(
          (
            sum,
            sale
          ) =>
            sum +
            getOrderAmountGhs(
              sale
            ),
          0
        );

    const bankTransferSales =
      sales
        .filter(
          (sale) =>
            sale.paymentMethod ===
            "BANK_TRANSFER"
        )
        .reduce(
          (
            sum,
            sale
          ) =>
            sum +
            getOrderAmountGhs(
              sale
            ),
          0
        );

    const onlineCardSales =
      sales
        .filter(
          (sale) =>
            sale.paymentMethod ===
            "ONLINE_CARD"
        )
        .reduce(
          (
            sum,
            sale
          ) =>
            sum +
            getOrderAmountGhs(
              sale
            ),
          0
        );

    return NextResponse.json({
      sales,
      totalOrders:
        sales.length,
      totalSales,
      cashSales,
      mobileMoneySales,
      bankTransferSales,
      onlineCardSales,
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
      "Daily sales report error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load daily sales report.",
      },
      {
        status: 500,
      }
    );
  }
}
