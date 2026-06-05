import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    console.log("API DB:", process.env.DATABASE_URL);

    const { email, pin } = await req.json();

    // ✅ DEBUG: Log incoming input
    console.log("INPUT:", { email, pin });

    // 1. Validate input
    if (!email || !pin) {
      return NextResponse.json(
        { error: "Email and PIN required" },
        { status: 400 }
      );
    }

    // 2. Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    // ✅ DEBUG: Log DB result
    console.log("DB ADMIN:", admin);

    // 3. Check admin existence + active
    if (!admin) {
      console.log("❌ Admin not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      console.log("❌ Admin not active");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Verify hashed PIN

const validPin = await bcrypt.compare(
  pin,
  admin.pinHash
);

if (!validPin) {
  console.log("❌ PIN mismatch");

  return NextResponse.json(
    { error: "Invalid credentials" },
    { status: 401 }
  );
}

    // 5. Success
    console.log("✅ LOGIN SUCCESS");

    const response = NextResponse.json({ success: true });

    // 6. Set cookie
    response.cookies.set(
      "dg_admin",
      JSON.stringify({
        id: admin.id,
        role: admin.role,
      }),
      {
        httpOnly: true,
        path: "/",
      }
    );

    return response;

  } catch (error) {
    console.error("❌ Admin login error:", error);

    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}