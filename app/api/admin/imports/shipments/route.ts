export const runtime = "nodejs";

import {
  ImportSourceApp,
  Prisma,
  ShippingMode,
} from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

async function requireImportManager() {
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

  const canManageImports =
    isSuperAdmin ||
    staff.role ===
      "MANAGER" ||
    staff.role ===
      "WAREHOUSE_MANAGER";

  if (!canManageImports) {
    throw new Error(
      "ImportManagementForbidden"
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
    "ImportManagementForbidden"
  ) {
    return NextResponse.json(
      {
        error:
          "You do not have permission to manage import shipments.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

/**
 * GET /api/admin/imports/shipments
 *
 * List import shipments.
 *
 * Allowed:
 * - SUPER_ADMIN
 * - MANAGER
 * - WAREHOUSE_MANAGER
 */
export async function GET() {
  try {
    await requireImportManager();

    const shipments =
      await prisma.importShipment.findMany({
        orderBy: {
          createdAt:
            "desc",
        },
      });

    return NextResponse.json({
      shipments,
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
      "List ImportShipments error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch import shipments.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/admin/imports/shipments
 *
 * Create a new DRAFT import shipment.
 *
 * Allowed:
 * - SUPER_ADMIN
 * - MANAGER
 * - WAREHOUSE_MANAGER
 */
export async function POST(
  req: Request
) {
  try {
    await requireImportManager();

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

    const reference =
      typeof record.reference ===
        "string"
        ? record.reference.trim()
        : "";

    const supplierName =
      typeof record.supplierName ===
        "string"
        ? record.supplierName.trim()
        : "";

    const sourceAppText =
      typeof record.sourceApp ===
        "string"
        ? record.sourceApp.trim()
        : "";

    const sourceApp =
      Object.values(
        ImportSourceApp
      ).includes(
        sourceAppText as ImportSourceApp
      )
        ? (sourceAppText as ImportSourceApp)
        : null;

    const sourceAppOther =
      typeof record.sourceAppOther ===
        "string" &&
      record.sourceAppOther.trim()
        ? record.sourceAppOther.trim()
        : null;

    const freightForwarderName =
      typeof record.freightForwarderName ===
        "string"
        ? record.freightForwarderName.trim()
        : "";

    const shippingModeText =
      typeof record.shippingMode ===
        "string"
        ? record.shippingMode.trim()
        : "";

    const shippingMode =
      Object.values(
        ShippingMode
      ).includes(
        shippingModeText as ShippingMode
      )
        ? (shippingModeText as ShippingMode)
        : null;

    const currency =
      typeof record.currency ===
        "string"
        ? record.currency.trim()
        : "";

    if (
      !reference ||
      !supplierName ||
      !sourceApp ||
      !freightForwarderName ||
      !shippingMode ||
      !currency ||
      record.exchangeRateSnapshot ===
        undefined ||
      record.exchangeRateSnapshot ===
        null ||
      record.exchangeRateSnapshot ===
        ""
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields.",
        },
        {
          status: 400,
        }
      );
    }

    let exchangeRateSnapshot:
      Prisma.Decimal;

    try {
      exchangeRateSnapshot =
        new Prisma.Decimal(
          String(
            record.exchangeRateSnapshot
          )
        );
    } catch {
      return NextResponse.json(
        {
          error:
            "Exchange rate must be a valid number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !exchangeRateSnapshot.isFinite() ||
      exchangeRateSnapshot.lte(0)
    ) {
      return NextResponse.json(
        {
          error:
            "Exchange rate must be greater than zero.",
        },
        {
          status: 400,
        }
      );
    }

    let supplierDeclaredCbm:
      | Prisma.Decimal
      | null = null;

    if (
      record.supplierDeclaredCbm !==
        undefined &&
      record.supplierDeclaredCbm !==
        null &&
      record.supplierDeclaredCbm !==
        ""
    ) {
      try {
        supplierDeclaredCbm =
          new Prisma.Decimal(
            String(
              record.supplierDeclaredCbm
            )
          );
      } catch {
        return NextResponse.json(
          {
            error:
              "Supplier declared CBM must be a valid number.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !supplierDeclaredCbm.isFinite() ||
        supplierDeclaredCbm.lt(0)
      ) {
        return NextResponse.json(
          {
            error:
              "Supplier declared CBM cannot be negative.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (
      sourceApp ===
        ImportSourceApp.OTHER &&
      !sourceAppOther
    ) {
      return NextResponse.json(
        {
          error:
            "Please specify the source application.",
        },
        {
          status: 400,
        }
      );
    }

    const shipment =
      await prisma.importShipment.create({
        data: {
          reference,
          supplierName,
          sourceApp,

          sourceAppOther:
            sourceApp ===
              ImportSourceApp.OTHER
              ? sourceAppOther
              : null,

          freightForwarderName,
          shippingMode,
          currency,
          exchangeRateSnapshot,
          supplierDeclaredCbm,

          status:
            "DRAFT",
        },
      });

    return NextResponse.json(
      {
        shipment,
      },
      {
        status: 201,
      }
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
      "Create ImportShipment error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create import shipment.",
      },
      {
        status: 500,
      }
    );
  }
}
