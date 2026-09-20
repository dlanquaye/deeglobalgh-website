import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ensureEstimatePublicToken } from "@/lib/estimator/ensureEstimatePublicToken";

export const runtime = "nodejs";

const SITE_URL =
  "https://www.shopdeeglobalgh.com";

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
        id: session.staffId,
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
          "You do not have permission to create quotation links.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

export async function POST(
  _request: Request,
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

    const token =
      await ensureEstimatePublicToken(
        cleanId
      );

    const url =
      `${SITE_URL}/q/${token}`;

    return NextResponse.json({
      success: true,
      token,
      url,
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
      "Quotation public-link error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create quotation link.";

    if (
      message ===
      "Estimate request not found."
    ) {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create quotation link.",
      },
      {
        status: 500,
      }
    );
  }
}
