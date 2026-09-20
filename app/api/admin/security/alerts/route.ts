import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
  request: Request
) {
  try {
    let session;

    try {
      session =
        await requireAdmin();
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

    if (
      session.role !==
      "SUPER_ADMIN"
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

    const body =
      await request.json();

    const markAll =
      body?.markAll ===
      true;

    const eventId =
      typeof body?.eventId ===
      "string"
        ? body.eventId.trim()
        : "";

    const now =
      new Date();

    if (markAll) {
      const result =
        await prisma.securityEvent.updateMany({
          where: {
            readAt: null,
          },
          data: {
            readAt:
              now,
          },
        });

      return NextResponse.json({
        success: true,
        updatedCount:
          result.count,
      });
    }

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Security event ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.securityEvent.findUnique({
        where: {
          id:
            eventId,
        },
        select: {
          id: true,
          readAt: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Security event not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      existing.readAt
    ) {
      return NextResponse.json({
        success: true,
        alreadyRead: true,
      });
    }

    await prisma.securityEvent.update({
      where: {
        id:
          eventId,
      },
      data: {
        readAt:
          now,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyRead: false,
    });
  } catch (error) {
    console.error(
      "Security alert update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update security alert.",
      },
      {
        status: 500,
      }
    );
  }
}
