import { prisma } from "@/lib/prisma";

export interface DatabaseHealthResult {
  ok: boolean;
  attempts: number;
  latencyMs: number;
  checkedAt: string;
  errorCode?: string;
  errorMessage?: string;
}

const DEFAULT_MAX_ATTEMPTS =
  2;

const DEFAULT_RETRY_DELAY_MS =
  250;

function sleep(
  milliseconds: number
) {
  return new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

function getSafeErrorDetails(
  error: unknown
): {
  errorCode?: string;
  errorMessage: string;
} {
  if (
    error &&
    typeof error ===
      "object"
  ) {
    const record =
      error as Record<
        string,
        unknown
      >;

    const code =
      typeof record.code ===
      "string"
        ? record.code
        : undefined;

    const message =
      typeof record.message ===
      "string"
        ? record.message
        : "Database health check failed.";

    return {
      errorCode:
        code,

      errorMessage:
        message
          .replace(
            /postgres(?:ql)?:\/\/[^\s]+/gi,
            "[database-url-redacted]"
          )
          .replace(
            /password\s*=\s*[^\s]+/gi,
            "password=[redacted]"
          )
          .slice(
            0,
            500
          ),
    };
  }

  return {
    errorMessage:
      "Database health check failed.",
  };
}

export async function checkDatabaseHealth(
  options?: {
    maxAttempts?: number;
    retryDelayMs?: number;
  }
): Promise<DatabaseHealthResult> {
  const maxAttempts =
    Math.max(
      1,
      Math.floor(
        options?.maxAttempts ??
          DEFAULT_MAX_ATTEMPTS
      )
    );

  const retryDelayMs =
    Math.max(
      0,
      Math.floor(
        options?.retryDelayMs ??
          DEFAULT_RETRY_DELAY_MS
      )
    );

  const startedAt =
    Date.now();

  let lastError:
    unknown = null;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    try {
      await prisma.$queryRaw`
        SELECT 1
      `;

      return {
        ok: true,
        attempts:
          attempt,
        latencyMs:
          Date.now() -
          startedAt,
        checkedAt:
          new Date().toISOString(),
      };
    } catch (error) {
      lastError =
        error;

      if (
        attempt <
          maxAttempts &&
        retryDelayMs >
          0
      ) {
        await sleep(
          retryDelayMs
        );
      }
    }
  }

  const safeError =
    getSafeErrorDetails(
      lastError
    );

  return {
    ok: false,
    attempts:
      maxAttempts,
    latencyMs:
      Date.now() -
      startedAt,
    checkedAt:
      new Date().toISOString(),
    errorCode:
      safeError.errorCode,
    errorMessage:
      safeError.errorMessage,
  };
}