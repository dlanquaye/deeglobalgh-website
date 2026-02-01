import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const { secret } = body;

  const envSecret = process.env.ADMIN_SECRET;

  console.log("🧪 ENTERED SECRET:", secret);
  console.log("🧪 ENV SECRET:", envSecret);
  console.log("🧪 ENV EXISTS:", !!envSecret);

  if (!envSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET missing on server" },
      { status: 500 }
    );
  }

  if (secret !== envSecret) {
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

  return NextResponse.json({ ok: true });
}
