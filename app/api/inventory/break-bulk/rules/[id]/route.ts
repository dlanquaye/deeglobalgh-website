export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function requireBreakBulkManager() {
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

  const canManageBreakBulk =
    isSuperAdmin ||
    staff.role ===
      "MANAGER" ||
    staff.role ===
      "WAREHOUSE_MANAGER";

  if (!canManageBreakBulk) {
    throw new Error(
      "BreakBulkManagementForbidden"
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
    "BreakBulkManagementForbidden"
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "You do not have permission to manage Break Bulk rules.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

export async function PATCH(
  req: Request,
  context: RouteContext
) {
  try {
    await requireBreakBulkManager();

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
            "Break Bulk rule ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingRule =
      await prisma.breakBulkRule.findUnique({
        where: {
          id:
            cleanId,
        },
        include: {
          sourceProduct: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },

          destinationProduct: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },

          _count: {
            select: {
              conversions:
                true,
            },
          },
        },
      });

    if (!existingRule) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Break Bulk rule not found.",
        },
        {
          status: 404,
        }
      );
    }

    let body: unknown;

    try {
      body =
        await req.json();
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

    const hasConversionRatio =
      Object.prototype
        .hasOwnProperty.call(
          record,
          "conversionRatio"
        );

    const hasIsActive =
      Object.prototype
        .hasOwnProperty.call(
          record,
          "isActive"
        );

    if (
      !hasConversionRatio &&
      !hasIsActive
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Provide conversionRatio or isActive to update the rule.",
        },
        {
          status: 400,
        }
      );
    }

    let conversionRatio:
      | number
      | undefined;

    let isActive:
      | boolean
      | undefined;

    if (
      hasConversionRatio
    ) {
      conversionRatio =
        Number(
          record.conversionRatio
        );

      if (
        !Number.isInteger(
          conversionRatio
        ) ||
        conversionRatio <=
          0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Conversion ratio must be a positive whole number.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (hasIsActive) {
      if (
        typeof record.isActive !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "isActive must be true or false.",
          },
          {
            status: 400,
          }
        );
      }

      isActive =
        record.isActive;
    }

    /*
     * Nothing to change.
     */
    if (
      conversionRatio ===
        existingRule.conversionRatio &&
      (
        isActive ===
          undefined ||
        isActive ===
          existingRule.isActive
      )
    ) {
      return NextResponse.json({
        success: true,
        rule:
          existingRule,
      });
    }

    const updatedRule =
      await prisma.breakBulkRule.update({
        where: {
          id:
            cleanId,
        },

        data: {
          ...(conversionRatio !==
          undefined
            ? {
                conversionRatio,
              }
            : {}),

          ...(isActive !==
          undefined
            ? {
                isActive,
              }
            : {}),
        },

        include: {
          sourceProduct: {
            select: {
              id: true,
              sku: true,
              name: true,
              isActive: true,
            },
          },

          destinationProduct: {
            select: {
              id: true,
              sku: true,
              name: true,
              isActive: true,
            },
          },

          _count: {
            select: {
              conversions:
                true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      rule:
        updatedRule,
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
      "Break Bulk rule PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update Break Bulk rule.",
      },
      {
        status: 500,
      }
    );
  }
}
