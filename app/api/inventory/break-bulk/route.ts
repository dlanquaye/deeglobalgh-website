export const runtime = "nodejs";

import {
  LocationType,
} from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { breakBulkInventory } from "@/lib/inventory/breakBulk";

function getErrorStatus(
  message: string
) {
  if (
    message.includes(
      "Insufficient stock"
    ) ||
    message.includes(
      "No inventory record exists"
    )
  ) {
    return 409;
  }

  if (
    message.includes(
      "required"
    ) ||
    message.includes(
      "invalid"
    ) ||
    message.includes(
      "inactive"
    ) ||
    message.includes(
      "must be"
    ) ||
    message.includes(
      "not found"
    ) ||
    message.includes(
      "must be different"
    )
  ) {
    return 400;
  }

  return 500;
}

export async function POST(
  req: Request
) {
  try {
    const session =
      await requireAdmin();

    if (!session.staffId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account is not linked to a staff record.",
        },
        {
          status: 403,
        }
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
          branchId: true,
        },
      });

    if (
      !staff ||
      !staff.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An active staff account is required.",
        },
        {
          status: 403,
        }
      );
    }

    const isSuperAdmin =
      session.role ===
        "SUPER_ADMIN" ||
      staff.role ===
        "SUPER_ADMIN";

    const canBreakBulk =
      isSuperAdmin ||
      staff.role ===
        "MANAGER" ||
      staff.role ===
        "WAREHOUSE_MANAGER";

    if (!canBreakBulk) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to perform Break Bulk conversions.",
        },
        {
          status: 403,
        }
      );
    }

    if (!session.branchId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No branch is assigned to this account.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * A normal branch manager may only
     * perform Break Bulk against their
     * assigned branch.
     */
    if (
      !isSuperAdmin &&
      staff.role ===
        "MANAGER" &&
      staff.branchId !==
        session.branchId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to perform Break Bulk for this branch.",
        },
        {
          status: 403,
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

    const ruleId =
      typeof record.ruleId ===
        "string"
        ? record.ruleId.trim()
        : "";

    const sourceQuantity =
      Number(
        record.sourceQuantity
      );

    const note =
      typeof record.note ===
        "string"
        ? record.note.trim()
        : undefined;

    if (!ruleId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Break Bulk rule is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        sourceQuantity
      ) ||
      sourceQuantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Break Bulk quantity must be a positive whole number.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await breakBulkInventory({
        ruleId,

        locationType:
          LocationType.BRANCH,

        locationId:
          session.branchId,

        sourceQuantity,

        createdByStaffId:
          staff.id,

        note,
      });

    return NextResponse.json(
      result,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Break Bulk conversion error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Break Bulk conversion failed";

    if (
      message ===
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
      message ===
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

    return NextResponse.json(
      {
        success: false,
        error:
          message,
      },
      {
        status:
          getErrorStatus(
            message
          ),
      }
    );
  }
}
