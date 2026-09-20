export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireAdmin } from "@/app/lib/adminAuth";

export async function POST() {
  try {
    const session =
      await requireAdmin();

    if (
      session.role !==
      "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to send the daily report.",
        },
        {
          status: 403,
        }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_BASE_URL is not configured."
      );
    }

    const cookieStore =
      await cookies();

    const cookieHeader =
      cookieStore
        .getAll()
        .map(
          (cookie) =>
            `${cookie.name}=${cookie.value}`
        )
        .join("; ");

    const res = await fetch(
      `${baseUrl}/api/admin/daily-report`,
      {
        headers: {
          cookie:
            cookieHeader,
        },
        cache: "no-store",
      }
    );

    const data =
      await res.json();

    if (!res.ok) {
      throw new Error(
        data?.error ||
          "Failed to fetch report"
      );
    }

    const message =
      typeof data?.message ===
      "string"
        ? data.message
        : "";

    if (!message) {
      throw new Error(
        "Daily report message is empty."
      );
    }

    const phone =
      "233246011773";

    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`;

    return NextResponse.json({
      success: true,
      whatsappUrl,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "CredentialChangeRequired"
    ) {
      return NextResponse.json(
        {
          error:
            "Credential change required.",
        },
        {
          status: 403,
        }
      );
    }

    console.error(
      "SEND REPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to send report",
      },
      {
        status: 500,
      }
    );
  }
}
