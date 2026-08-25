import { NextResponse } from "next/server";

import { checkDatabaseHealth } from "@/lib/database/checkDatabaseHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health =
    await checkDatabaseHealth({
      maxAttempts: 2,
      retryDelayMs: 250,
    });

  if (!health.ok) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: {
          ok: false,
          attempts:
            health.attempts,
          latencyMs:
            health.latencyMs,
          checkedAt:
            health.checkedAt,
          errorCode:
            health.errorCode ??
            null,
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }

  return NextResponse.json(
    {
      status: "healthy",
      database: {
        ok: true,
        attempts:
          health.attempts,
        latencyMs:
          health.latencyMs,
        checkedAt:
          health.checkedAt,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    }
  );
}