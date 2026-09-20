import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

import SecurityAlertActions from "./SecurityAlertActions";

export const runtime = "nodejs";

function formatGhanaDate(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone:
        "Africa/Accra",
      dateStyle:
        "medium",
      timeStyle:
        "medium",
    }
  ).format(
    value
  );
}

function formatEventType(
  value: string
) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

export default async function SecurityPage() {
  let session;

  try {
    session =
      await requireAdmin();
  } catch {
    redirect(
      "/admin/login"
    );
  }

  if (
    session.role !==
    "SUPER_ADMIN"
  ) {
    redirect(
      "/admin"
    );
  }

  const events =
    await prisma.securityEvent.findMany({
      orderBy: {
        createdAt:
          "desc",
      },
      take: 100,
    });

  const unreadCount =
    events.filter(
      (event) =>
        !event.readAt
    ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              ← Back to Control Board
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Security Alerts
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Review account-security events including credential changes,
              resets, account status changes and login activity.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Unread Alerts
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {unreadCount}
              </p>
            </div>

            {unreadCount > 0 && (
              <SecurityAlertActions
                markAll
              />
            )}
          </div>
        </div>

        {events.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No security events yet
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Security events will appear here when account actions are recorded.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {events.map(
              (event) => {
                const unread =
                  !event.readAt;

                return (
                  <article
                    key={
                      event.id
                    }
                    className={
                      unread
                        ? "rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm"
                        : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    }
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-950">
                            {formatEventType(
                              event.eventType
                            )}
                          </h2>

                          {unread && (
                            <span className="rounded-full bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white">
                              New
                            </span>
                          )}

                          <span
                            className={
                              event.success
                                ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800"
                                : "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800"
                            }
                          >
                            {event.success
                              ? "Success"
                              : "Failed"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {event.description ||
                            "No additional description recorded."}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                        <div className="text-sm text-slate-500">
                          {formatGhanaDate(
                            event.createdAt
                          )}
                        </div>

                        {unread && (
                          <SecurityAlertActions
                            eventId={
                              event.id
                            }
                          />
                        )}
                      </div>
                    </div>

                    <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Affected Account
                        </dt>

                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {event.subjectName ||
                            "Unknown"}
                        </dd>

                        {event.subjectEmail && (
                          <dd className="mt-1 break-all text-xs text-slate-500">
                            {event.subjectEmail}
                          </dd>
                        )}

                        {event.subjectRole && (
                          <dd className="mt-1 text-xs text-slate-500">
                            {event.subjectRole}
                          </dd>
                        )}
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Performed By
                        </dt>

                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {event.actorName ||
                            "System"}
                        </dd>

                        {event.actorRole && (
                          <dd className="mt-1 text-xs text-slate-500">
                            {event.actorRole}
                          </dd>
                        )}
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Device
                        </dt>

                        <dd className="mt-1 text-sm text-slate-900">
                          {event.deviceSummary ||
                            "Not available"}
                        </dd>

                        {event.userAgent && (
                          <dd
                            className="mt-1 line-clamp-2 break-all text-xs text-slate-500"
                            title={
                              event.userAgent
                            }
                          >
                            {event.userAgent}
                          </dd>
                        )}
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          IP Address
                        </dt>

                        <dd className="mt-1 break-all text-sm text-slate-900">
                          {event.ipAddress ||
                            "Not available"}
                        </dd>

                        {event.readAt && (
                          <dd className="mt-2 text-xs text-slate-500">
                            Reviewed:{" "}
                            {formatGhanaDate(
                              event.readAt
                            )}
                          </dd>
                        )}
                      </div>
                    </dl>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}
