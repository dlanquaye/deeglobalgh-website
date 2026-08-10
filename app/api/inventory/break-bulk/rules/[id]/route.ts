export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get("dg_admin")?.value;

  if (!rawCookie) {
    return null;
  }

  try {
    return JSON.parse(
      decodeURIComponent(rawCookie)
    ) as AdminSession;
  } catch {
    return null;
  }
}

export async function PATCH(
  req: Request,
  context: RouteContext
) {
  try {
    // ==============================
    // AUTHENTICATION
    // ==============================
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Break Bulk rule ID is required",
        },
        { status: 400 }
      );
    }

    // ==============================
    // LOAD EXISTING RULE
    // ==============================
    const existingRule =
      await prisma.breakBulkRule.findUnique({
        where: {
          id,
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
              conversions: true,
            },
          },
        },
      });

    if (!existingRule) {
      return NextResponse.json(
        {
          success: false,
          error: "Break Bulk rule not found",
        },
        { status: 404 }
      );
    }

    // ==============================
    // REQUEST BODY
    // ==============================
    const body = await req.json();

    const hasConversionRatio =
      Object.prototype.hasOwnProperty.call(
        body,
        "conversionRatio"
      );

    const hasIsActive =
      Object.prototype.hasOwnProperty.call(
        body,
        "isActive"
      );

    if (!hasConversionRatio && !hasIsActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Provide conversionRatio or isActive to update the rule",
        },
        { status: 400 }
      );
    }

    let conversionRatio:
      | number
      | undefined;

    let isActive:
      | boolean
      | undefined;

    // ==============================
    // VALIDATE RATIO
    // ==============================
    if (hasConversionRatio) {
      conversionRatio =
        Number(body.conversionRatio);

      if (
        !Number.isInteger(conversionRatio) ||
        conversionRatio <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Conversion ratio must be a positive whole number",
          },
          { status: 400 }
        );
      }
    }

    // ==============================
    // VALIDATE ACTIVE STATUS
    // ==============================
    if (hasIsActive) {
      if (
        typeof body.isActive !== "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "isActive must be true or false",
          },
          { status: 400 }
        );
      }

      isActive = body.isActive;
    }

    // ==============================
    // UPDATE RULE
    // ==============================
    const updatedRule =
      await prisma.breakBulkRule.update({
        where: {
          id,
        },
        data: {
          ...(conversionRatio !== undefined
            ? { conversionRatio }
            : {}),
          ...(isActive !== undefined
            ? { isActive }
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
              conversions: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      rule: updatedRule,
    });
  } catch (error) {
    console.error(
      "Break Bulk rule PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update Break Bulk rule",
      },
      { status: 500 }
    );
  }
}