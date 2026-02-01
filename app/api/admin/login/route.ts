import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const { secret } = body;

  if (!secret) {
    return NextResponse.json(
      { error: "Missing admin secret" },
      { status: 400 }
    );
  }

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: "Invalid admin secret" },
      { status: 401 }
    );
  }

  // ✅ cookies() IS ASYNC IN APP ROUTER
  const cookieStore = await cookies();

  cookieStore.set("dg_admin", "authorized", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return NextResponse.json({ ok: true });
}
