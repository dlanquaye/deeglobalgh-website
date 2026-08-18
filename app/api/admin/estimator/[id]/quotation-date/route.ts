import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // ==========================================
    // ADMIN AUTHENTICATION
    // ==========================================
    const cookieStore =
      await cookies();

    const adminCookie =
      cookieStore.get("dg_admin");

    if (!adminCookie?.value) {
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

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Estimate ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const rawDate =
      typeof body?.quotationDate ===
      "string"
        ? body.quotationDate.trim()
        : "";

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        rawDate
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quotation date must be a valid date.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Store at midday UTC.
     *
     * quotationDate represents a business
     * document DATE rather than an event time.
     * Midday avoids accidental previous/next-day
     * rendering caused by timezone conversion.
     *
     * Ghana is UTC, but keeping this convention
     * makes the field safer if formatting changes
     * later.
     */
    const quotationDate =
      new Date(
        `${rawDate}T12:00:00.000Z`
      );

    if (
      Number.isNaN(
        quotationDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quotation date is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.estimateRequest.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Estimate request not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updated =
      await prisma.estimateRequest.update({
        where: {
          id,
        },
        data: {
          quotationDate,
        },
        select: {
          id: true,
          quotationDate: true,
          quotedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      quotationDate:
        updated.quotationDate,
      quotedAt:
        updated.quotedAt,
    });
  } catch (error) {
    console.error(
      "Quotation date update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update quotation date.",
      },
      {
        status: 500,
      }
    );
  }
}
