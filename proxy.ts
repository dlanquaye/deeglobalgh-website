import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyAdminSessionToken } from "@/app/lib/adminSession";

export async function proxy(
  req: NextRequest
) {
  const { pathname } =
    req.nextUrl;

  const isAdminUI =
    pathname.startsWith(
      "/admin"
    );

  const isAdminAPI =
    pathname.startsWith(
      "/api/admin"
    );

  if (
    !isAdminUI &&
    !isAdminAPI
  ) {
    return NextResponse.next();
  }

  if (
    pathname ===
      "/admin/login" ||
    pathname ===
      "/api/admin-login"
  ) {
    return NextResponse.next();
  }

  const sessionCookie =
    req.cookies.get(
      "dg_admin"
    );

  if (
    !sessionCookie?.value
  ) {
    return handleUnauthorized(
      req,
      isAdminAPI
    );
  }

  const session =
    await verifyAdminSessionToken(
      sessionCookie.value
    );

  if (
    !session ||
    !session.adminId
  ) {
    return handleUnauthorized(
      req,
      isAdminAPI
    );
  }

  const isCredentialChangePage =
    pathname ===
    "/admin/account";

  const isCredentialChangeApi =
    pathname ===
    "/api/admin/account/change-credential";

  if (
    session.mustChangeCredential
  ) {
    if (
      isCredentialChangePage ||
      isCredentialChangeApi
    ) {
      return NextResponse.next();
    }

    if (isAdminAPI) {
      return NextResponse.json(
        {
          error:
            "Credential change required",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.redirect(
      new URL(
        "/admin/account",
        req.url
      )
    );
  }

  /*
   * Proxy verifies the signed token and
   * enforces the signed forced-change flag.
   *
   * No Prisma/database access belongs here.
   *
   * requireAdmin() performs the authoritative
   * database checks later, including:
   *
   * - Admin still exists
   * - Admin is active
   * - linked Staff is active
   * - credentialVersion still matches
   * - mustChangeCredential still matches DB state
   * - current trusted role/staff/branch values
   */
  return NextResponse.next();
}

function handleUnauthorized(
  req: NextRequest,
  isAdminAPI: boolean
) {
  if (isAdminAPI) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.redirect(
    new URL(
      "/admin/login",
      req.url
    )
  );
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
