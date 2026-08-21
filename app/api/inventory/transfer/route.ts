import { NextResponse } from "next/server";
import { LocationType } from "@prisma/client";

import { requireAdmin } from "@/app/lib/adminAuth";
import { transferInventory } from "@/lib/inventory/transfer";

const WAREHOUSE_ID = "cmq4b5g1j0001g3jgy501zz76";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

export async function POST(req: Request) {
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

    const body = await req.json();

    const productId =
      typeof body?.productId === "string"
        ? body.productId.trim()
        : "";

    const quantity = Number(
      body?.quantity
    );

    if (!productId) {
      return NextResponse.json(
        {
          error:
            "Product is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Quantity must be a positive whole number",
        },
        { status: 400 }
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
          session.staffId,
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
      message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
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
          error: message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Transfer failed",
      },
      { status: 500 }
    );
  }
}
