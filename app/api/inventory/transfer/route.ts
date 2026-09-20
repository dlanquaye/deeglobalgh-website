import {
  LocationType,
} from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { transferInventory } from "@/lib/inventory/transfer";

const WAREHOUSE_ID =
  "cmq4b5g1j0001g3jgy501zz76";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

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

    const canTransferInventory =
      isSuperAdmin ||
      staff.role ===
        "MANAGER" ||
      staff.role ===
        "WAREHOUSE_MANAGER";

    if (
      !canTransferInventory
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to transfer inventory.",
        },
        {
          status: 403,
        }
      );
    }

    if (!session.branchId) {
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

    /*
     * A normal branch manager may only
     * transfer warehouse stock into their
     * own assigned branch.
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
          error:
            "You do not have permission to transfer inventory to this branch.",
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

    const productId =
      typeof record.productId ===
        "string"
        ? record.productId.trim()
        : "";

    const quantity =
      Number(
        record.quantity
      );

    if (!productId) {
      return NextResponse.json(
        {
          error:
            "Product is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Quantity must be a positive whole number.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await transferInventory({
        productId,
        quantity,

        fromLocationType:
          LocationType.WAREHOUSE,

        fromLocationId:
          WAREHOUSE_ID,

        toLocationType:
          LocationType.BRANCH,

        toLocationId:
          session.branchId,

        createdByStaffId:
          staff.id,
      });

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "Inventory transfer error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Transfer failed";

    if (
      message ===
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
      message ===
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
      message ===
        "Source inventory record not found" ||
      message ===
        "Insufficient stock at source location" ||
      message ===
        "Transfer quantity must be greater than zero"
    ) {
      return NextResponse.json(
        {
          error:
            message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Transfer failed",
      },
      {
        status: 500,
      }
    );
  }
}
