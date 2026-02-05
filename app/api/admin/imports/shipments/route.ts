export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

/**
 * Admin authentication guard
 */
async function requireAdmin() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("dg_admin");

  if (!adminCookie || adminCookie.value !== "authorized") {
    throw new Error("UNAUTHORIZED");
  }
}

/**
 * GET /api/admin/imports/shipments
 * List all import shipments (admin only)
 */
export async function GET(req: Request) {
  try {
    await requireAdmin();

    const shipments = await prisma.importShipment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ shipments });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("List ImportShipments error:", err);
    return NextResponse.json(
      { error: "Failed to fetch import shipments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/imports/shipments
 * Create a new import shipment (DRAFT)
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const {
      reference,
      supplierName,
      sourceApp,
      sourceAppOther,
      freightForwarderName,
      shippingMode,
      currency,
      exchangeRateSnapshot,
      supplierDeclaredCbm,
    } = body;

    if (
      !reference ||
      !supplierName ||
      !sourceApp ||
      !freightForwarderName ||
      !shippingMode ||
      !currency ||
      exchangeRateSnapshot === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const shipment = await prisma.importShipment.create({
      data: {
        reference,
        supplierName,
        sourceApp,
        sourceAppOther:
          sourceApp === "OTHER" ? sourceAppOther ?? null : null,
        freightForwarderName,
        shippingMode,
        currency,
        exchangeRateSnapshot: new Prisma.Decimal(exchangeRateSnapshot),
        supplierDeclaredCbm:
          supplierDeclaredCbm !== undefined
            ? new Prisma.Decimal(supplierDeclaredCbm)
            : null,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ shipment });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Create ImportShipment error:", err);
    return NextResponse.json(
      { error: "Failed to create import shipment" },
      { status: 500 }
    );
  }
}
