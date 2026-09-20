export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  try {
    await requireBreakBulkManager();

    const rules =
      await prisma.breakBulkRule.findMany({
        include: {
          sourceProduct: {
            select: {
              id: true,
              sku: true,
              name: true,
              isActive: true,
              stockQty: true,
            },
          },
          destinationProduct: {
            select: {
              id: true,
              sku: true,
              name: true,
              isActive: true,
              stockQty: true,
            },
          },
          _count: {
            select: {
              conversions: true,
            },
          },
        },
        orderBy: [
          {
            isActive: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      rules,
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
      "Break Bulk rules GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load Break Bulk rules.",
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
    await requireBreakBulkManager();

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

    const sourceProductId =
      typeof record.sourceProductId ===
        "string"
        ? record.sourceProductId.trim()
        : "";

    const destinationProductId =
      typeof record.destinationProductId ===
        "string"
        ? record.destinationProductId.trim()
        : "";

    const conversionRatio =
      Number(
        record.conversionRatio
      );

    if (!sourceProductId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Source product is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!destinationProductId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Destination product is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      sourceProductId ===
      destinationProductId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Source and destination products must be different.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        conversionRatio
      ) ||
      conversionRatio <= 0
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

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: [
              sourceProductId,
              destinationProductId,
            ],
          },
        },
        select: {
          id: true,
          sku: true,
          name: true,
          isActive: true,
        },
      });

    const sourceProduct =
      products.find(
        (product) =>
          product.id ===
          sourceProductId
      );

    const destinationProduct =
      products.find(
        (product) =>
          product.id ===
          destinationProductId
      );

    if (!sourceProduct) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Source product not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!destinationProduct) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Destination product not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!sourceProduct.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Source product must be active.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !destinationProduct.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Destination product must be active.",
        },
        {
          status: 400,
        }
      );
    }

    const existingRule =
      await prisma.breakBulkRule.findUnique({
        where: {
          sourceProductId_destinationProductId:
            {
              sourceProductId,
              destinationProductId,
            },
        },
      });

    if (existingRule) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A Break Bulk rule already exists for these products.",
        },
        {
          status: 409,
        }
      );
    }

    const rule =
      await prisma.breakBulkRule.create({
        data: {
          sourceProductId,
          destinationProductId,
          conversionRatio,
          isActive: true,
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
        },
      });

    return NextResponse.json(
      {
        success: true,
        rule,
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
      "Break Bulk rules POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create Break Bulk rule.",
      },
      {
        status: 500,
      }
    );
  }
}
