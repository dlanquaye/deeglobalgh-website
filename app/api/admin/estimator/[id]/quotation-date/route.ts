import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function requireEstimatorSalesAccess() {
  const session =
    await requireAdmin();

  if (!session.staffId) {
    throw new Error(
      "StaffAccountRequired"
    );
  }

  const staff =
    await prisma.staff.findUnique({
      where: {
        id:
          session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
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

  const canManageQuotation =
    isSuperAdmin ||
    staff.role ===
      "MANAGER" ||
    staff.role ===
      "SALES";

  if (!canManageQuotation) {
    throw new Error(
      "EstimatorSalesForbidden"
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
        success: false,
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
        success: false,
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
        success: false,
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
    "EstimatorSalesForbidden"
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "You do not have permission to update quotation dates.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

function parseQuotationDate(
  rawDate: string
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      rawDate
    )
  ) {
    return null;
  }

  const [
    yearText,
    monthText,
    dayText,
  ] =
    rawDate.split("-");

  const year =
    Number(yearText);

  const month =
    Number(monthText);

  const day =
    Number(dayText);

  const quotationDate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0
      )
    );

  if (
    Number.isNaN(
      quotationDate.getTime()
    )
  ) {
    return null;
  }

  /*
   * Reject calendar dates that JavaScript
   * would otherwise normalise, such as
   * 2026-02-31 becoming a date in March.
   */
  if (
    quotationDate.getUTCFullYear() !==
      year ||
    quotationDate.getUTCMonth() !==
      month - 1 ||
    quotationDate.getUTCDate() !==
      day
  ) {
    return null;
  }

  return quotationDate;
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireEstimatorSalesAccess();

    const {
      id,
    } =
      await context.params;

    const cleanId =
      String(
        id ?? ""
      ).trim();

    if (!cleanId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Estimate ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
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

    const rawDate =
      typeof record.quotationDate ===
        "string"
        ? record.quotationDate.trim()
        : "";

    const quotationDate =
      parseQuotationDate(
        rawDate
      );

    if (!quotationDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quotation date must be a valid calendar date in YYYY-MM-DD format.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.estimateRequest.findUnique({
        where: {
          id:
            cleanId,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Estimate request not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * quotationDate is a business-document
     * date rather than an event timestamp.
     *
     * Midday UTC avoids accidental day shifts
     * during future formatting changes.
     */
    const updated =
      await prisma.estimateRequest.update({
        where: {
          id:
            cleanId,
        },
        data: {
          quotationDate,
        },
        select: {
          id: true,
          quotationDate: true,
          quotedAt: true,
        },
      });

    return NextResponse.json({
      success: true,

      quotationDate:
        updated.quotationDate,

      quotedAt:
        updated.quotedAt,
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
      "Quotation date update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update quotation date.",
      },
      {
        status: 500,
      }
    );
  }
}
