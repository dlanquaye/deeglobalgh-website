import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: Request
) {
  try {
    let session;

    try {
      session =
        await requireAdmin();
    } catch {
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

    const orderId =
      typeof record.orderId ===
        "string"
        ? record.orderId.trim()
        : "";

    const reason =
      typeof record.reason ===
        "string"
        ? record.reason.trim()
        : "";

    if (
      !orderId ||
      reason.length < 5
    ) {
      return NextResponse.json(
        {
          error:
            "Reason required (minimum 5 characters)",
        },
        {
          status: 400,
        }
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          orderId,
        },
        select: {
          id: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.orderEvent.create({
      data: {
        orderId:
          order.id,

        adminId:
          session.adminId,

        eventType:
          "VIEWED",

        description:
          reason,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Log order view error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to log event",
      },
      {
        status: 500,
      }
    );
  }
}
