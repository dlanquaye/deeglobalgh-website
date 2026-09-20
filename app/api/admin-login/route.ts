import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { createAdminSessionToken } from "@/app/lib/adminSession";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const SESSION_MAX_AGE_SECONDS =
  8 * 60 * 60;

function getClientIp(
  request: Request
) {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for"
    );

  if (forwardedFor) {
    return (
      forwardedFor
        .split(",")[0]
        ?.trim() ||
      null
    );
  }

  return (
    request.headers.get(
      "x-real-ip"
    ) ||
    null
  );
}

function getDeviceSummary(
  userAgent: string | null
) {
  if (!userAgent) {
    return null;
  }

  const value =
    userAgent.toLowerCase();

  let browser =
    "Unknown browser";

  if (
    value.includes(
      "edg/"
    )
  ) {
    browser =
      "Microsoft Edge";
  } else if (
    value.includes(
      "chrome/"
    )
  ) {
    browser =
      "Google Chrome";
  } else if (
    value.includes(
      "firefox/"
    )
  ) {
    browser =
      "Mozilla Firefox";
  } else if (
    value.includes(
      "safari/"
    )
  ) {
    browser =
      "Safari";
  }

  let device =
    "Desktop";

  if (
    value.includes(
      "android"
    )
  ) {
    device =
      "Android";
  } else if (
    value.includes(
      "iphone"
    )
  ) {
    device =
      "iPhone";
  } else if (
    value.includes(
      "ipad"
    )
  ) {
    device =
      "iPad";
  } else if (
    value.includes(
      "windows"
    )
  ) {
    device =
      "Windows PC";
  } else if (
    value.includes(
      "macintosh"
    ) ||
    value.includes(
      "mac os"
    )
  ) {
    device =
      "Mac";
  } else if (
    value.includes(
      "linux"
    )
  ) {
    device =
      "Linux computer";
  }

  return `${browser} on ${device}`;
}

async function writeLoginEvent({
  admin,
  success,
  ipAddress,
  userAgent,
  deviceSummary,
}: {
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  deviceSummary: string | null;
}) {
  try {
    await prisma.securityEvent.create({
      data: {
        subjectAdminId:
          admin.id,

        subjectName:
          admin.name,

        subjectEmail:
          admin.email,

        subjectRole:
          admin.role,

        /*
         * A successful login has a verified
         * actor identity.
         *
         * A failed login attempt must not claim
         * the person attempting authentication
         * is actually the account owner.
         */
        actorAdminId:
          success
            ? admin.id
            : null,

        actorName:
          success
            ? admin.name
            : null,

        actorRole:
          success
            ? admin.role
            : null,

        eventType:
          success
            ? "LOGIN_SUCCESS"
            : "LOGIN_FAILED",

        ipAddress,
        userAgent,
        deviceSummary,

        success,

        description:
          success
            ? `${admin.name} signed in successfully.`
            : `Failed login attempt for ${admin.email}.`,
      },
    });
  } catch (error) {
    /*
     * Security-event logging is important,
     * but an audit-write failure must not
     * accidentally lock every valid Admin out
     * of the application.
     */
    console.error(
      "Login security event logging error:",
      error
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    let body: unknown;

    try {
      body =
        await req.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !==
        "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const record =
      body as Record<
        string,
        unknown
      >;

    const normalizedEmail =
      typeof record.email ===
        "string"
        ? record.email
            .trim()
            .toLowerCase()
        : "";

    const pin =
      typeof record.pin ===
        "string"
        ? record.pin
        : "";

    if (
      !normalizedEmail ||
      !pin
    ) {
      return NextResponse.json(
        {
          error:
            "Email and PIN required.",
        },
        {
          status: 400,
        }
      );
    }

    const userAgent =
      req.headers.get(
        "user-agent"
      );

    const ipAddress =
      getClientIp(
        req
      );

    const deviceSummary =
      getDeviceSummary(
        userAgent
      );

    const admin =
      await prisma.admin.findUnique({
        where: {
          email:
            normalizedEmail,
        },

        include: {
          staff: {
            include: {
              branch:
                true,
            },
          },
        },
      });

    /*
     * Do not create SecurityEvent rows for
     * arbitrary unknown email addresses.
     *
     * This avoids allowing unauthenticated
     * internet traffic to flood the audit table.
     */
    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Invalid credentials.",
        },
        {
          status: 401,
        }
      );
    }

    if (!admin.isActive) {
      await writeLoginEvent({
        admin,
        success:
          false,
        ipAddress,
        userAgent,
        deviceSummary,
      });

      return NextResponse.json(
        {
          error:
            "Invalid credentials.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      admin.staff &&
      !admin.staff.isActive
    ) {
      await writeLoginEvent({
        admin,
        success:
          false,
        ipAddress,
        userAgent,
        deviceSummary,
      });

      return NextResponse.json(
        {
          error:
            "Invalid credentials.",
        },
        {
          status: 401,
        }
      );
    }

    const validPin =
      await bcrypt.compare(
        pin,
        admin.pinHash
      );

    if (!validPin) {
      await writeLoginEvent({
        admin,
        success:
          false,
        ipAddress,
        userAgent,
        deviceSummary,
      });

      return NextResponse.json(
        {
          error:
            "Invalid credentials.",
        },
        {
          status: 401,
        }
      );
    }

    const sessionToken =
      await createAdminSessionToken(
        {
          adminId:
            admin.id,

          role:
            admin.role,

          staffId:
            admin.staff?.id ??
            null,

          branchId:
            admin.staff
              ?.branch?.id ??
            null,

          staffName:
            admin.staff?.name ??
            null,

          credentialVersion:
            admin
              .credentialVersion,

          mustChangeCredential:
            admin
              .mustChangeCredential,
        },

        SESSION_MAX_AGE_SECONDS
      );

    /*
     * Login succeeds independently of the
     * security-event write. The event helper
     * handles its own audit failure safely.
     */
    await writeLoginEvent({
      admin,
      success:
        true,
      ipAddress,
      userAgent,
      deviceSummary,
    });

    const response =
      NextResponse.json({
        success: true,

        mustChangeCredential:
          admin
            .mustChangeCredential,
      });

    response.cookies.set(
      "dg_admin",
      sessionToken,
      {
        httpOnly:
          true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          "lax",

        path:
          "/",

        maxAge:
          SESSION_MAX_AGE_SECONDS,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Login failed.",
      },
      {
        status: 500,
      }
    );
  }
}
