import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { secret } = await req.json();

  console.log("🔐 ENTERED PIN:", secret);
  console.log("🔐 ENV PIN:", process.env.ADMIN_SECRET);

  if (!process.env.ADMIN_SECRET) {
    console.error("❌ ADMIN_SECRET IS MISSING");
    return NextResponse.json(
      { error: "Admin secret not set on server" },
      { status: 500 }
    );
  }

  if (secret !== process.env.ADMIN_SECRET) {
    console.error("❌ PIN MISMATCH");
    return NextResponse.json(
      { error: "Invalid admin secret" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("dg_admin", "authorized", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return res;
}
