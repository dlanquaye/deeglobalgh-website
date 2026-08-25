import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mockQueryRaw =
  vi.hoisted(() =>
    vi.fn()
  );

vi.mock(
  "@/lib/prisma",
  () => ({
    prisma: {
      $queryRaw:
        mockQueryRaw,
    },
  })
);

import { checkDatabaseHealth } from "@/lib/database/checkDatabaseHealth";

describe(
  "checkDatabaseHealth",
  () => {
    beforeEach(() => {
      mockQueryRaw.mockReset();
    });

    it(
      "reports healthy when the database responds on the first attempt",
      async () => {
        mockQueryRaw.mockResolvedValueOnce([
          {
            "?column?": 1,
          },
        ]);

        const result =
          await checkDatabaseHealth({
            maxAttempts: 2,
            retryDelayMs: 0,
          });

        expect(
          result.ok
        ).toBe(
          true
        );

        expect(
          result.attempts
        ).toBe(
          1
        );

        expect(
          result.latencyMs
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          Number.isNaN(
            Date.parse(
              result.checkedAt
            )
          )
        ).toBe(
          false
        );

        expect(
          mockQueryRaw
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );

    it(
      "retries a transient failure and succeeds on the second attempt",
      async () => {
        mockQueryRaw
          .mockRejectedValueOnce(
            new Error(
              "Temporary database connection failure."
            )
          )
          .mockResolvedValueOnce([
            {
              "?column?": 1,
            },
          ]);

        const result =
          await checkDatabaseHealth({
            maxAttempts: 2,
            retryDelayMs: 0,
          });

        expect(
          result.ok
        ).toBe(
          true
        );

        expect(
          result.attempts
        ).toBe(
          2
        );

        expect(
          mockQueryRaw
        ).toHaveBeenCalledTimes(
          2
        );
      }
    );

    it(
      "returns a safe unhealthy result after all attempts fail",
      async () => {
        mockQueryRaw.mockRejectedValue(
          Object.assign(
            new Error(
              "Unable to connect to postgres://user:secret-password@example.neon.tech/database"
            ),
            {
              code:
                "P1001",
            }
          )
        );

        const result =
          await checkDatabaseHealth({
            maxAttempts: 2,
            retryDelayMs: 0,
          });

        expect(
          result.ok
        ).toBe(
          false
        );

        expect(
          result.attempts
        ).toBe(
          2
        );

        expect(
          result.errorCode
        ).toBe(
          "P1001"
        );

        expect(
          result.errorMessage
        ).toContain(
          "[database-url-redacted]"
        );

        expect(
          result.errorMessage
        ).not.toContain(
          "secret-password"
        );

        expect(
          result.errorMessage
        ).not.toContain(
          "postgres://"
        );

        expect(
          mockQueryRaw
        ).toHaveBeenCalledTimes(
          2
        );
      }
    );
  }
);