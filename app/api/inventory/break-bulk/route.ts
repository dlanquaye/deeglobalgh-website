export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LocationType } from "@prisma/client";

import { breakBulkInventory } from "@/lib/inventory/breakBulk";

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

function getErrorStatus(message: string) {
  if (
    message.includes("Insufficient stock") ||
    message.includes("No inventory record exists")
  ) {
    return 409;
  }

  if (
    message.includes("required") ||
    message.includes("invalid") ||
    message.includes("inactive") ||
    message.includes("must be") ||
    message.includes("not found") ||
    message.includes("must be different")
  ) {
    return 400;
  }

  return 500;
}

export async function POST(req: Request) {
  try {
    // ==============================
    // AUTHENTICATED ADMIN SESSION
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

    if (!session.branchId) {
      return NextResponse.json(
        {
          success: false,
          error: "No branch is assigned to this account",
        },
        { status: 400 }
      );
    }

    const actorId =
      session.staffId ?? session.adminId;

    if (!actorId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No staff or admin identity is available",
        },
        { status: 400 }
      );
    }

    // ==============================
    // REQUEST BODY
    // ==============================
    const body = await req.json();

    const ruleId =
      typeof body.ruleId === "string"
        ? body.ruleId.trim()
        : "";

    const sourceQuantity =
      Number(body.sourceQuantity);

    const note =
      typeof body.note === "string"
        ? body.note.trim()
        : undefined;

    if (!ruleId) {
      return NextResponse.json(
        {
          success: false,
          error: "Break Bulk rule is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(sourceQuantity) ||
      sourceQuantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Break Bulk quantity must be a positive whole number",
        },
        { status: 400 }
      );
    }

    // ==============================
    // EXECUTE BRANCH CONVERSION
    // ==============================
    const result = await breakBulkInventory({
      ruleId,
      locationType: LocationType.BRANCH,
      locationId: session.branchId,
      sourceQuantity,
      createdByStaffId: actorId,
      note,
    });

    return NextResponse.json(
      result,
      { status: 200 }
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

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: getErrorStatus(message),
      }
    );
  }
}