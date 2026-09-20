import {
  AdminRole,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

export async function GET() {
  try {
    try {
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
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const [
      accounts,
      eligibleStaff,
    ] =
      await Promise.all([
        prisma.admin.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            credentialChangedAt:
              true,
            mustChangeCredential:
              true,
            credentialVersion:
              true,
            staff: {
              select: {
                id: true,
                staffNumber: true,
                name: true,
                role: true,
                isActive: true,
                branch: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: [
            {
              role: "asc",
            },
            {
              name: "asc",
            },
          ],
        }),

        prisma.staff.findMany({
          where: {
            isActive: true,
            adminAccount: null,
          },
          select: {
            id: true,
            staffNumber: true,
            name: true,
            role: true,
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      accounts,
      eligibleStaff,
    });
  } catch (error) {
    console.error(
      "Admin accounts GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load administration accounts.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
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
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const staffId =
      typeof body?.staffId ===
      "string"
        ? body.staffId.trim()
        : "";

    const email =
      typeof body?.email ===
      "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const temporaryPin =
      typeof body?.temporaryPin ===
      "string"
        ? body.temporaryPin.trim()
        : "";

    if (
      !staffId ||
      !email ||
      !temporaryPin
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Staff member, email and temporary PIN are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !email.includes("@") ||
      email.startsWith("@") ||
      email.endsWith("@")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

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

    const [
      staff,
      existingEmail,
      actor,
    ] =
      await Promise.all([
        prisma.staff.findUnique({
          where: {
            id:
              staffId,
          },
          select: {
            id: true,
            staffNumber: true,
            name: true,
            role: true,
            isActive: true,
            adminAccount: {
              select: {
                id: true,
              },
            },
          },
        }),

        prisma.admin.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
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

    if (
      !staff ||
      !staff.isActive
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Active staff member not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      staff.adminAccount
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This staff member already has an administration account.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      existingEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An administration account already uses this email address.",
        },
        {
          status: 409,
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

    const pinHash =
      await bcrypt.hash(
        temporaryPin,
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

    const created =
      await prisma.$transaction(
        async (tx) => {
          const account =
            await tx.admin.create({
              data: {
                name:
                  staff.name,
                email,
                pinHash,

                /*
                 * Normal staff login accounts
                 * are ADMIN accounts.
                 *
                 * Operational permissions remain
                 * represented by Staff.role.
                 *
                 * SUPER_ADMIN creation is not
                 * exposed through this endpoint.
                 */
                role:
                  AdminRole.ADMIN,

                isActive:
                  true,

                staffId:
                  staff.id,

                credentialVersion:
                  1,

                credentialChangedAt:
                  new Date(),

                mustChangeCredential:
                  true,
              },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                mustChangeCredential:
                  true,
                createdAt: true,
              },
            });

          await tx.securityEvent.create({
            data: {
              subjectAdminId:
                account.id,
              subjectName:
                account.name,
              subjectEmail:
                account.email,
              subjectRole:
                account.role,

              actorAdminId:
                actor.id,
              actorName:
                actor.name,
              actorRole:
                actor.role,

              eventType:
                "ACCOUNT_CREATED",

              ipAddress,
              userAgent,
              deviceSummary,

              success:
                true,

              description:
                `${actor.name} created an administration account for ${staff.name} (${staff.staffNumber}).`,
            },
          });

          return account;
        }
      );

    return NextResponse.json(
      {
        success: true,
        account:
          created,
        message:
          "Administration account created. The staff member must change the temporary PIN after signing in.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Admin account creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create administration account.",
      },
      {
        status: 500,
      }
    );
  }
}
