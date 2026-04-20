import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminUI = pathname.startsWith("/admin");
  const isAdminAPI = pathname.startsWith("/api/admin");

  // Allow non-admin routes
  if (!isAdminUI && !isAdminAPI) {
    return NextResponse.next();
  }

  // Allow login routes
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin-login"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("dg_admin");

  // No cookie → unauthorized
  if (!sessionCookie) {
    return handleUnauthorized(req, isAdminAPI);
  }

  let sessionData: { id: string; role: string } | null = null;

  try {
    sessionData = JSON.parse(sessionCookie.value);
  } catch {
    return handleUnauthorized(req, isAdminAPI);
  }

  // No valid session ID → unauthorized
  if (!sessionData?.id) {
    return handleUnauthorized(req, isAdminAPI);
  }

  // ✅ IMPORTANT: NO Prisma here (Edge safe)
  return NextResponse.next();
}

function handleUnauthorized(
  req: NextRequest,
  isAdminAPI: boolean
) {
  if (isAdminAPI) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.redirect(
    new URL("/admin/login", req.url)
  );
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};