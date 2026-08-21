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

    const deposits =
      await prisma.bankDeposit.findMany({
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
      deposits
    );
  } catch (error) {
    console.error(
      "Bank deposit loading error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (message === "Unauthorized") {
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
          "Failed to fetch bank deposits",
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

    const bankName =
      typeof body?.bankName ===
      "string"
        ? body.bankName.trim()
        : "";

    const amount =
      Number(body?.amount);

    const referenceNumber =
      typeof body?.referenceNumber ===
        "string" &&
      body.referenceNumber.trim()
        ? body.referenceNumber.trim()
        : null;

    const depositMethod =
      typeof body?.depositMethod ===
      "string"
        ? body.depositMethod.trim()
        : "";

    const notes =
      typeof body?.notes ===
        "string" &&
      body.notes.trim()
        ? body.notes.trim()
        : null;

    if (!bankName) {
      return NextResponse.json(
        {
          error:
            "Bank name is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(amount) ||
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

    if (!depositMethod) {
      return NextResponse.json(
        {
          error:
            "Deposit method is required",
        },
        { status: 400 }
      );
    }

    const deposit =
      await prisma.bankDeposit.create({
        data: {
          bankName,
          amount,
          referenceNumber,
          depositMethod,
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
      deposit
    );
  } catch (error) {
    console.error(
      "Bank deposit creation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (message === "Unauthorized") {
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
          "Failed to create bank deposit",
      },
      { status: 500 }
    );
  }
}
