import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

import {
  type AdminSession,
  verifyAdminSessionToken,
} from "@/app/lib/adminSession";

const globalForPrisma =
  globalThis as unknown as {
    adminAuthPrisma?: PrismaClient;
  };

const prisma =
  globalForPrisma.adminAuthPrisma ??
  new PrismaClient();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForPrisma.adminAuthPrisma =
    prisma;
}

export interface TrustedAdminSession {
  adminId: string;
  role: string;
  staffId: string | null;
  branchId: string | null;
  staffName: string | null;
  credentialVersion: number;
  mustChangeCredential: boolean;
}

export interface RequireAdminOptions {
  allowMustChangeCredential?: boolean;
}

async function validateSignedSession(
  session: AdminSession
): Promise<TrustedAdminSession> {
  const admin =
    await prisma.admin.findUnique({
      where: {
        id: session.adminId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        credentialVersion: true,
        mustChangeCredential: true,
        staff: {
          select: {
            id: true,
            name: true,
            isActive: true,
            branchId: true,
          },
        },
      },
    });

  if (
    !admin ||
    !admin.isActive
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  if (
    admin.staff &&
    !admin.staff.isActive
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  if (
    admin.credentialVersion !==
    session.credentialVersion
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  return {
    adminId:
      admin.id,

    role:
      admin.role,

    staffId:
      admin.staff?.id ??
      null,

    branchId:
      admin.staff?.branchId ??
      null,

    staffName:
      admin.staff?.name ??
      null,

    credentialVersion:
      admin.credentialVersion,

    mustChangeCredential:
      admin.mustChangeCredential,
  };
}

export async function requireAdmin(
  options: RequireAdminOptions = {}
): Promise<TrustedAdminSession> {
  const cookieStore =
    await cookies();

  const rawCookie =
    cookieStore.get(
      "dg_admin"
    )?.value;

  if (!rawCookie) {
    throw new Error(
      "Unauthorized"
    );
  }

  const signedSession =
    await verifyAdminSessionToken(
      rawCookie
    );

  if (!signedSession) {
    throw new Error(
      "Unauthorized"
    );
  }

  const trustedSession =
    await validateSignedSession(
      signedSession
    );

  if (
    trustedSession.mustChangeCredential &&
    !options.allowMustChangeCredential
  ) {
    throw new Error(
      "CredentialChangeRequired"
    );
  }

  return trustedSession;
}
