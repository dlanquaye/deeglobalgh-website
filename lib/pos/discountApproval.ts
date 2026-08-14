import {
  AdminRole,
  StaffRole,
} from "@prisma/client";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

import type {
  PosDiscountAssessment,
} from "@/lib/pos/discounts";

export class PosDiscountApprovalError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400
  ) {
    super(message);
    this.name =
      "PosDiscountApprovalError";
    this.statusCode = statusCode;
  }
}

export type DiscountApprovalCredentials = {
  email: string;
  pin: string;
};

export type DiscountApprovalSnapshot = {
  approvedById: string;
  approvedByName: string;
  approvedByRole: string;
  approvedAt: Date;
};

type ApprovalStaffRecord = {
  id: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
  maxDiscountPercent: number | null;
};

type ApprovalAdminRecord = {
  id: string;
  name: string;
  email: string;
  pinHash: string;
  role: AdminRole;
  isActive: boolean;
  staff: ApprovalStaffRecord | null;
};

export type DiscountApprovalDependencies = {
  findAdminByEmail?: (
    email: string
  ) => Promise<
    ApprovalAdminRecord | null
  >;

  comparePin?: (
    pin: string,
    pinHash: string
  ) => Promise<boolean>;

  now?: () => Date;
};

function validateAuthorityPercent(
  value: number
): number {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new PosDiscountApprovalError(
      "The approver's discount authority is not configured correctly."
    );
  }

  return value;
}

function hasSufficientAuthority({
  assessment,
  authorityPercent,
}: {
  assessment: PosDiscountAssessment;
  authorityPercent: number;
}): boolean {
  const allowedPercent =
    validateAuthorityPercent(
      authorityPercent
    );

  return (
    assessment.effectiveDiscountPercent <=
    allowedPercent
  );
}

async function defaultFindAdminByEmail(
  email: string
): Promise<
  ApprovalAdminRecord | null
> {
  return prisma.admin.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      pinHash: true,
      role: true,
      isActive: true,
      staff: {
        select: {
          id: true,
          name: true,
          role: true,
          isActive: true,
          maxDiscountPercent: true,
        },
      },
    },
  });
}

async function defaultComparePin(
  pin: string,
  pinHash: string
): Promise<boolean> {
  return bcrypt.compare(
    pin,
    pinHash
  );
}

export async function verifyPosDiscountApproval({
  credentials,
  assessment,
  dependencies = {},
}: {
  credentials: DiscountApprovalCredentials;
  assessment: PosDiscountAssessment;
  dependencies?: DiscountApprovalDependencies;
}): Promise<DiscountApprovalSnapshot> {
  const email =
    typeof credentials.email ===
    "string"
      ? credentials.email
          .trim()
          .toLowerCase()
      : "";

  const pin =
    typeof credentials.pin ===
    "string"
      ? credentials.pin.trim()
      : "";

  if (!email || !pin) {
    throw new PosDiscountApprovalError(
      "Manager email and PIN are required.",
      400
    );
  }

  if (
    assessment.hasUnconfiguredFloor
  ) {
    throw new PosDiscountApprovalError(
      "This discount cannot be approved until every discounted product has a minimum selling price or cost price configured.",
      400
    );
  }

  const findAdminByEmail =
    dependencies.findAdminByEmail ??
    defaultFindAdminByEmail;

  const comparePin =
    dependencies.comparePin ??
    defaultComparePin;

  const now =
    dependencies.now ??
    (() => new Date());

  const admin =
    await findAdminByEmail(
      email
    );

  if (
    !admin ||
    !admin.isActive
  ) {
    throw new PosDiscountApprovalError(
      "Invalid manager credentials.",
      401
    );
  }

  if (
    admin.staff &&
    !admin.staff.isActive
  ) {
    throw new PosDiscountApprovalError(
      "Invalid manager credentials.",
      401
    );
  }

  const validPin =
    await comparePin(
      pin,
      admin.pinHash
    );

  if (!validPin) {
    throw new PosDiscountApprovalError(
      "Invalid manager credentials.",
      401
    );
  }

  const staff =
    admin.staff;

  const isSuperAdmin =
    admin.role ===
      AdminRole.SUPER_ADMIN ||
    staff?.role ===
      StaffRole.SUPER_ADMIN;

  if (isSuperAdmin) {
    return {
      approvedById:
        staff?.id ??
        admin.id,

      approvedByName:
        staff?.name ??
        admin.name,

      approvedByRole:
        staff?.role ??
        admin.role,

      approvedAt: now(),
    };
  }

  if (
    !staff ||
    staff.role !==
      StaffRole.MANAGER
  ) {
    throw new PosDiscountApprovalError(
      "This account is not authorised to approve POS discounts.",
      403
    );
  }

  if (
    staff.maxDiscountPercent ===
    null
  ) {
    throw new PosDiscountApprovalError(
      "This manager has no discount approval limit configured.",
      403
    );
  }

  if (
    !hasSufficientAuthority({
      assessment,
      authorityPercent:
        staff.maxDiscountPercent,
    })
  ) {
    throw new PosDiscountApprovalError(
      "This discount exceeds the manager's configured approval limit.",
      403
    );
  }

  return {
    approvedById: staff.id,
    approvedByName:
      staff.name,
    approvedByRole:
      staff.role,
    approvedAt: now(),
  };
}