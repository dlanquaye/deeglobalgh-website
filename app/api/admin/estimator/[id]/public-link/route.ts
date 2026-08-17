import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ensureEstimatePublicToken } from "@/lib/estimator/ensureEstimatePublicToken";

export const runtime = "nodejs";

const SITE_URL =
  "https://www.shopdeeglobalgh.com";

export async function POST(
  _request: Request,
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
      cookieStore.get(
        "dg_admin"
      );

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

    // ==========================================
    // ESTIMATE
    // ==========================================
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

    // ==========================================
    // CREATE OR REUSE SECURE TOKEN
    // ==========================================
    const token =
      await ensureEstimatePublicToken(
        id
      );

    const url =
      `${SITE_URL}/q/${token}`;

    return NextResponse.json({
      success: true,
      token,
      url,
    });
  } catch (error) {
    console.error(
      "Quotation public-link error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create quotation link.";

    if (
      message ===
      "Estimate request not found."
    ) {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create quotation link.",
      },
      {
        status: 500,
      }
    );
  }
}
