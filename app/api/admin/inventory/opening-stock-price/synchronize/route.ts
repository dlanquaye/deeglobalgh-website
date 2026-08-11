export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import {
  applyOpeningStockPrice,
  type OpeningStockPriceItem,
} from "@/lib/inventory/openingStockPrice";

type AdminSession = {
  adminId?: string;
  staffId?: string | null;
  branchId?: string | null;
  role?: string;
  staffName?: string | null;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readOptionalNumber(
  target: UnknownRecord,
  key: string
): number | undefined {
  const value = target[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number") {
    throw new Error(
      `${key} must be a number`
    );
  }

  return value;
}

function normaliseSyncItem(
  value: unknown,
  index: number
): OpeningStockPriceItem {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid synchronisation item at position ${index + 1}`
    );
  }

  const productId = value.productId;
  const sku = value.sku;
  const rawTarget = value.target;

  if (
    typeof productId !== "string" ||
    !productId.trim()
  ) {
    throw new Error(
      `Product ID is required at position ${index + 1}`
    );
  }

  if (
    typeof sku !== "string" ||
    !sku.trim()
  ) {
    throw new Error(
      `SKU is required at position ${index + 1}`
    );
  }

  if (!isRecord(rawTarget)) {
    throw new Error(
      `Target values are required for SKU ${sku}`
    );
  }

  const target: OpeningStockPriceItem["target"] = {
    costPrice: readOptionalNumber(
      rawTarget,
      "costPrice"
    ),

    retailPrice: readOptionalNumber(
      rawTarget,
      "retailPrice"
    ),

    wholesalePrice: readOptionalNumber(
      rawTarget,
      "wholesalePrice"
    ),

    distributorPrice: readOptionalNumber(
      rawTarget,
      "distributorPrice"
    ),

    stockQty: readOptionalNumber(
      rawTarget,
      "stockQty"
    ),
  };

  return {
    productId: productId.trim(),
    sku: sku.trim(),
    target,
  };
}

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      (await requireAdmin()) as AdminSession;

    if (!session.branchId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No branch is assigned to this account",
        },
        {
          status: 400,
        }
      );
    }

    const actorId =
      session.staffId ??
      session.adminId;

    if (!actorId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to identify the staff or admin account",
        },
        {
          status: 401,
        }
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid JSON request body",
        },
        {
          status: 400,
        }
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const rawSyncItems =
      body.syncItems;

    if (
      !Array.isArray(rawSyncItems) ||
      rawSyncItems.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Opening Stock & Price changes were supplied",
        },
        {
          status: 400,
        }
      );
    }

    const items =
      rawSyncItems.map(
        normaliseSyncItem
      );

    const report =
      await applyOpeningStockPrice({
        items,
        branchId:
          session.branchId,
        createdByStaffId:
          actorId,
      });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error(
      "Opening Stock & Price synchronisation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to synchronise Opening Stock & Price";

    if (
      message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}