import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isStrongCredential(
  value: string
) {
  return (
    value.length >= 10 &&
    /[A-Za-z]/.test(value) &&
    /\d/.test(value)
  );
}

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
      "mobile"
    )
  ) {
    device =
      "Mobile";
  }

  return `${device} - ${browser}`;
}

async function requireSuperAdmin() {
  const session =
    await requireAdmin();

  if (
    session.role !==
    "SUPER_ADMIN"
  ) {
    throw new Error(
      "FORBIDDEN"
    );
  }

  return session;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    let session;

    try {
      session =
        await requireSuperAdmin();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "FORBIDDEN"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
          },
          {
            status: 403,
          }
        );
      }

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

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Administration account ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const action =
      typeof body?.action ===
      "string"
        ? body.action.trim()
        : "";

    if (
      action !== "enable" &&
      action !== "disable" &&
      action !== "resetCredential"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid account action.",
        },
        {
          status: 400,
        }
      );
    }

    const [
      target,
      actor,
    ] =
      await Promise.all([
        prisma.admin.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            credentialVersion:
              true,
            staff: {
              select: {
                id: true,
                staffNumber: true,
                name: true,
                role: true,
              },
            },
          },
        }),

        prisma.admin.findUnique({
          where: {
            id:
              session.adminId,
          },
          select: {
            id: true,
            name: true,
            role: true,
          },
        }),
      ]);

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Administration account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!actor) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Super Admin account could not be verified.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      action === "disable" &&
      target.id ===
        session.adminId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot disable your own Super Admin account.",
        },
        {
          status: 400,
        }
      );
    }

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

    if (
      action === "enable"
    ) {
      if (
        target.isActive
      ) {
        return NextResponse.json({
          success: true,
          alreadyEnabled:
            true,
        });
      }

      await prisma.$transaction(
        async (tx) => {
          await tx.admin.update({
            where: {
              id:
                target.id,
            },
            data: {
              isActive:
                true,
            },
          });

          await tx.securityEvent.create({
            data: {
              subjectAdminId:
                target.id,
              subjectName:
                target.name,
              subjectEmail:
                target.email,
              subjectRole:
                target.role,

              actorAdminId:
                actor.id,
              actorName:
                actor.name,
              actorRole:
                actor.role,

              eventType:
                "ACCOUNT_ENABLED",

              ipAddress,
              userAgent,
              deviceSummary,

              success:
                true,

              description:
                `${actor.name} enabled the administration account for ${target.name}.`,
            },
          });
        }
      );

      return NextResponse.json({
        success: true,
        message:
          "Administration account enabled.",
      });
    }

    if (
      action === "disable"
    ) {
      if (
        !target.isActive
      ) {
        return NextResponse.json({
          success: true,
          alreadyDisabled:
            true,
        });
      }

      await prisma.$transaction(
        async (tx) => {
          await tx.admin.update({
            where: {
              id:
                target.id,
            },
            data: {
              isActive:
                false,

              /*
               * Invalidate any existing signed
               * sessions immediately.
               */
              credentialVersion: {
                increment: 1,
              },
            },
          });

          await tx.securityEvent.create({
            data: {
              subjectAdminId:
                target.id,
              subjectName:
                target.name,
              subjectEmail:
                target.email,
              subjectRole:
                target.role,

              actorAdminId:
                actor.id,
              actorName:
                actor.name,
              actorRole:
                actor.role,

              eventType:
                "ACCOUNT_DISABLED",

              ipAddress,
              userAgent,
              deviceSummary,

              success:
                true,

              description:
                `${actor.name} disabled the administration account for ${target.name}.`,
            },
          });
        }
      );

      return NextResponse.json({
        success: true,
        message:
          "Administration account disabled.",
      });
    }

    const temporaryPin =
      typeof body?.temporaryPin ===
      "string"
        ? body.temporaryPin.trim()
        : "";

    if (
      !isStrongCredential(
        temporaryPin
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Temporary PIN must be at least 10 characters and include at least one letter and one number.",
        },
        {
          status: 400,
        }
      );
    }

    const pinHash =
      await bcrypt.hash(
        temporaryPin,
        12
      );

    const now =
      new Date();

    await prisma.$transaction(
      async (tx) => {
        await tx.admin.update({
          where: {
            id:
              target.id,
          },
          data: {
            pinHash,

            credentialVersion: {
              increment: 1,
            },

            credentialChangedAt:
              now,

            mustChangeCredential:
              true,
          },
        });

        await tx.securityEvent.create({
          data: {
            subjectAdminId:
              target.id,
            subjectName:
              target.name,
            subjectEmail:
              target.email,
            subjectRole:
              target.role,

            actorAdminId:
              actor.id,
            actorName:
              actor.name,
            actorRole:
              actor.role,

            eventType:
              "PASSWORD_RESET",

            ipAddress,
            userAgent,
            deviceSummary,

            success:
              true,

            description:
              `${actor.name} reset the administration credential for ${target.name}.`,
          },
        });
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Credential reset. The account must change the temporary PIN after signing in.",
    });
  } catch (error) {
    console.error(
      "Administration account PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update administration account.",
      },
      {
        status: 500,
      }
    );
  }
}
