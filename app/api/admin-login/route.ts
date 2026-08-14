import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, pin } = await req.json();

    // 1. Validate input
    if (!email || !pin) {
      return NextResponse.json(
        { error: "Email and PIN required" },
        { status: 400 }
      );
    }

    // 2. Find admin and linked staff record
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: {
        staff: {
          include: {
            branch: true,
          },
        },
      },
    });

    // 3. Check account existence and status
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Verify the hashed PIN
    const validPin = await bcrypt.compare(
      pin,
      admin.pinHash
    );

    if (!validPin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 5. Create authenticated admin session
    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      "dg_admin",
      JSON.stringify({
        adminId: admin.id,
        role: admin.role,
        staffId: admin.staff?.id ?? null,
        branchId:
          admin.staff?.branch?.id ?? null,
        staffName:
          admin.staff?.name ?? null,
      }),
      {
        httpOnly: true,
        path: "/",
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}