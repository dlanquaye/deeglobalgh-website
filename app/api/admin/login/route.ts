export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();

  const incoming = String(body?.secret ?? "").trim();
  const envSecret = String(process.env.ADMIN_SECRET ?? "").trim();

  console.log("🔐 ADMIN LOGIN ATTEMPT");
  console.log("➡️ Incoming length:", incoming.length);
  console.log("➡️ Env length:", envSecret.length);
  console.log("➡️ Match:", incoming === envSecret);

  if (!envSecret) {
    console.error("❌ ADMIN_SECRET NOT SET");
    return NextResponse.json(
      { error: "Admin not configured" },
      { status: 500 }
    );
  }

  if (incoming !== envSecret) {
    console.error("❌ PIN MISMATCH");
    return NextResponse.json(
      { error: "Invalid admin secret" },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();

  cookieStore.set("dg_admin", "authorized", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  console.log("✅ ADMIN LOGIN SUCCESS");

  return NextResponse.json({ ok: true });
}
