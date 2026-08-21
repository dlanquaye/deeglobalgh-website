import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

type AdminSession = {
  adminId?: string;
  role?: string;
  staffId?: string | null;
  branchId?: string | null;
  staffName?: string | null;
};

export async function GET() {
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

    const purchases =
      await prisma.purchase.findMany({
        where: {
          branchId:
            session.branchId,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          branch: true,
          enteredByStaff: true,
        },
      });

    return NextResponse.json(
      purchases
    );
  } catch (error) {
    console.error(
      "Purchase loading error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
      "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to fetch purchases",
      },
      { status: 500 }
    );
  }
}

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

    const body =
      await req.json();

    const supplierName =
      typeof body?.supplierName ===
      "string"
        ? body.supplierName.trim()
        : "";

    const amount =
      Number(body?.amount);

    const referenceNumber =
      typeof body?.referenceNumber ===
        "string" &&
      body.referenceNumber.trim()
        ? body.referenceNumber.trim()
        : null;

    const notes =
      typeof body?.notes ===
        "string" &&
      body.notes.trim()
        ? body.notes.trim()
        : null;

    if (!supplierName) {
      return NextResponse.json(
        {
          error:
            "Supplier name is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Amount must be greater than zero",
        },
        { status: 400 }
      );
    }

    const purchase =
      await prisma.purchase.create({
        data: {
          supplierName,
          amount,
          referenceNumber,
          notes,

          branchId:
            session.branchId,

          enteredByStaffId:
            session.staffId,
        },

        include: {
          branch: true,
          enteredByStaff: true,
        },
      });

    return NextResponse.json(
      purchase
    );
  } catch (error) {
    console.error(
      "Purchase creation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
      "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to create purchase",
      },
      { status: 500 }
    );
  }
}
