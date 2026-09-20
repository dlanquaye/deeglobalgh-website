import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
    browser = "Microsoft Edge";
  } else if (
    value.includes(
      "chrome/"
    )
  ) {
    browser = "Google Chrome";
  } else if (
    value.includes(
      "firefox/"
    )
  ) {
    browser = "Mozilla Firefox";
  } else if (
    value.includes(
      "safari/"
    )
  ) {
    browser = "Safari";
  }

  let device =
    "Desktop";

  if (
    value.includes(
      "android"
    )
  ) {
    device = "Android";
  } else if (
    value.includes(
      "iphone"
    )
  ) {
    device = "iPhone";
  } else if (
    value.includes(
      "ipad"
    )
  ) {
    device = "iPad";
  } else if (
    value.includes(
      "mobile"
    )
  ) {
    device = "Mobile";
  }

  return `${device} - ${browser}`;
}

export async function POST(
  request: Request
) {
  try {
    let session;

    try {
      session =
        await requireAdmin({
          allowMustChangeCredential: true,
        });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const currentPin =
      typeof body?.currentPin ===
      "string"
        ? body.currentPin.trim()
        : "";

    const newPin =
      typeof body?.newPin ===
      "string"
        ? body.newPin.trim()
        : "";

    const confirmPin =
      typeof body?.confirmPin ===
      "string"
        ? body.confirmPin.trim()
        : "";

    if (
      !currentPin ||
      !newPin ||
      !confirmPin
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Current PIN, new PIN and confirmation are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newPin !==
      confirmPin
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "New PIN and confirmation do not match.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newPin.length < 10 ||
      !/[A-Za-z]/.test(newPin) ||
      !/\d/.test(newPin)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "New PIN must be at least 10 characters and include at least one letter and one number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      currentPin ===
      newPin
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "New PIN must be different from the current PIN.",
        },
        {
          status: 400,
        }
      );
    }

    const admin =
      await prisma.admin.findUnique({
        where: {
          id:
            session.adminId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          pinHash: true,
          credentialVersion:
            true,
        },
      });

    if (
      !admin ||
      !admin.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const validCurrentPin =
      await bcrypt.compare(
        currentPin,
        admin.pinHash
      );

    if (
      !validCurrentPin
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Current PIN is incorrect.",
        },
        {
          status: 400,
        }
      );
    }

    const newPinHash =
      await bcrypt.hash(
        newPin,
        12
      );

    const userAgent =
      request.headers.get(
        "user-agent"
      );

    const ipAddress =
      getClientIp(
        request
      );

    const deviceSummary =
      getDeviceSummary(
        userAgent
      );

    const now =
      new Date();

    await prisma.$transaction(
      async (tx) => {
        await tx.admin.update({
          where: {
            id:
              admin.id,
          },
          data: {
            pinHash:
              newPinHash,
            credentialVersion: {
              increment: 1,
            },
            credentialChangedAt:
              now,
            mustChangeCredential:
              false,
          },
        });

        await tx.securityEvent.create({
          data: {
            subjectAdminId:
              admin.id,
            subjectName:
              admin.name,
            subjectEmail:
              admin.email,
            subjectRole:
              admin.role,

            actorAdminId:
              admin.id,
            actorName:
              admin.name,
            actorRole:
              admin.role,

            eventType:
              "PASSWORD_CHANGED",

            ipAddress,
            userAgent,
            deviceSummary,

            success:
              true,

            description:
              `${admin.name} changed their account credential.`,
          },
        });
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "PIN changed successfully. Please sign in again.",
    });
  } catch (error) {
    console.error(
      "Change credential error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to change PIN.",
      },
      {
        status: 500,
      }
    );
  }
}
