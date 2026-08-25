import { NextResponse } from "next/server";

import { sendOrderSMS } from "@/app/lib/hubtelSms";
import { checkDatabaseHealth } from "@/lib/database/checkDatabaseHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorised(
  request: Request
): boolean {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const authorization =
    request.headers.get(
      "authorization"
    );

  return (
    authorization ===
    `Bearer ${cronSecret}`
  );
}

export async function GET(
  request: Request
) {
  if (
    !isAuthorised(
      request
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Unauthorised.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  }

  const health =
    await checkDatabaseHealth({
      maxAttempts: 2,
      retryDelayMs: 500,
    });

  if (
    health.ok
  ) {
    return NextResponse.json(
      {
        status:
          "healthy",
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

  const alertPhone =
    process.env.DB_ALERT_PHONE;

  let alertSent =
    false;

  let alertError:
    string | null =
      null;

  if (
    alertPhone
  ) {
    try {
      const message = [
        "DeeglobalGH DATABASE ALERT",
        "",
        "The production database health check failed.",
        `Attempts: ${health.attempts}`,
        `Latency: ${health.latencyMs}ms`,
        `Code: ${health.errorCode ?? "unknown"}`,
        `Checked: ${health.checkedAt}`,
        "",
        "Please check Neon and Vercel immediately.",
      ].join(
        "\n"
      );

      await sendOrderSMS({
        phone:
          alertPhone,
        message,
      });

      alertSent =
        true;
    } catch (error) {
      console.error(
        "Database health alert SMS failed:",
        error instanceof Error
          ? error.message
          : "Unknown SMS error"
      );

      alertError =
        "SMS alert could not be sent.";
    }
  } else {
    alertError =
      "DB_ALERT_PHONE is not configured.";
  }

  console.error(
    "Database health check failed:",
    {
      attempts:
        health.attempts,
      latencyMs:
        health.latencyMs,
      checkedAt:
        health.checkedAt,
      errorCode:
        health.errorCode ??
        null,
      alertSent,
    }
  );

  return NextResponse.json(
    {
      status:
        "unhealthy",

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

      alert: {
        sent:
          alertSent,
        error:
          alertError,
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