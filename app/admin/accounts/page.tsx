import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

import AccountManagementClient from "./AccountManagementClient";

export const runtime = "nodejs";

export default async function AdminAccountsPage() {
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

  const [
    accounts,
    eligibleStaff,
  ] =
    await Promise.all([
      prisma.admin.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          credentialChangedAt:
            true,
          mustChangeCredential:
            true,
          credentialVersion:
            true,
          staff: {
            select: {
              id: true,
              staffNumber: true,
              name: true,
              role: true,
              isActive: true,
              branch: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            role:
              "asc",
          },
          {
            name:
              "asc",
          },
        ],
      }),

      prisma.staff.findMany({
        where: {
          isActive:
            true,
          adminAccount:
            null,
        },
        select: {
          id: true,
          staffNumber: true,
          name: true,
          role: true,
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name:
            "asc",
        },
      }),
    ]);

  const serialisedAccounts =
    accounts.map(
      (
        account
      ) => ({
        id:
          account.id,
        name:
          account.name,
        email:
          account.email,
        role:
          account.role,
        isActive:
          account.isActive,
        mustChangeCredential:
          account.mustChangeCredential,
        credentialVersion:
          account.credentialVersion,
        createdAt:
          account.createdAt.toISOString(),
        credentialChangedAt:
          account.credentialChangedAt
            ?.toISOString() ??
          null,
        staff:
          account.staff
            ? {
                id:
                  account.staff.id,
                staffNumber:
                  account.staff.staffNumber,
                name:
                  account.staff.name,
                role:
                  account.staff.role,
                isActive:
                  account.staff.isActive,
                branch:
                  account.staff.branch
                    ? {
                        id:
                          account.staff.branch.id,
                        name:
                          account.staff.branch.name,
                      }
                    : null,
              }
            : null,
      })
    );

  const serialisedEligibleStaff =
    eligibleStaff.map(
      (
        staff
      ) => ({
        id:
          staff.id,
        staffNumber:
          staff.staffNumber,
        name:
          staff.name,
        role:
          staff.role,
        branch:
          staff.branch
            ? {
                id:
                  staff.branch.id,
                name:
                  staff.branch.name,
              }
            : null,
      })
    );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            ← Back to Control Board
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Administration Accounts
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Create and manage staff administration logins,
            disable access, reset credentials and require
            staff to choose a new PIN after a reset.
          </p>
        </div>

        <AccountManagementClient
          accounts={
            serialisedAccounts
          }
          eligibleStaff={
            serialisedEligibleStaff
          }
          currentAdminId={
            session.adminId
          }
        />
      </div>
    </main>
  );
}
