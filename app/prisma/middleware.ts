import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Only protect admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminPin = process.env.ADMIN_PIN;

  // Safety check
  if (!adminPin) {
    console.error("❌ ADMIN_PIN not set");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Read pin from URL (?pin=1234)
  const providedPin = searchParams.get("pin");

  if (providedPin !== adminPin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
