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

export async function GET() {
  try {
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

    const rules = await prisma.breakBulkRule.findMany({
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
    console.error(
      "Break Bulk rules GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load Break Bulk rules",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
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

    const body = await req.json();

    const sourceProductId =
      typeof body.sourceProductId === "string"
        ? body.sourceProductId.trim()
        : "";

    const destinationProductId =
      typeof body.destinationProductId === "string"
        ? body.destinationProductId.trim()
        : "";

    const conversionRatio =
      Number(body.conversionRatio);

    if (!sourceProductId) {
      return NextResponse.json(
        {
          success: false,
          error: "Source product is required",
        },
        { status: 400 }
      );
    }

    if (!destinationProductId) {
      return NextResponse.json(
        {
          success: false,
          error: "Destination product is required",
        },
        { status: 400 }
      );
    }

    if (
      sourceProductId === destinationProductId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Source and destination products must be different",
        },
        { status: 400 }
      );
    }

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

    const products = await prisma.product.findMany({
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

    const sourceProduct = products.find(
      (product) =>
        product.id === sourceProductId
    );

    const destinationProduct = products.find(
      (product) =>
        product.id === destinationProductId
    );

    if (!sourceProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Source product not found",
        },
        { status: 404 }
      );
    }

    if (!destinationProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Destination product not found",
        },
        { status: 404 }
      );
    }

    if (!sourceProduct.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Source product must be active",
        },
        { status: 400 }
      );
    }

    if (!destinationProduct.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Destination product must be active",
        },
        { status: 400 }
      );
    }

    const existingRule =
      await prisma.breakBulkRule.findUnique({
        where: {
          sourceProductId_destinationProductId: {
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
            "A Break Bulk rule already exists for these products",
        },
        { status: 409 }
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
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Break Bulk rules POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create Break Bulk rule",
      },
      { status: 500 }
    );
  }
}