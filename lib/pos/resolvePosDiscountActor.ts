import {
  StaffRole,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  DiscountActorInput,
} from "@/lib/pos/discounts";

export class PosDiscountActorError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400
  ) {
    super(message);
    this.name =
      "PosDiscountActorError";
    this.statusCode =
      statusCode;
  }
}

type DiscountStaffRecord = {
  id: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
  branchId: string | null;
  maxDiscountPercent:
    | number
    | null;
};

export type PosDiscountActorDependencies = {
  findStaffById?: (
    staffId: string
  ) => Promise<
    DiscountStaffRecord | null
  >;
};

async function defaultFindStaffById(
  staffId: string
): Promise<
  DiscountStaffRecord | null
> {
  return prisma.staff.findUnique({
    where: {
      id: staffId,
    },

    select: {
      id: true,
      name: true,
      role: true,
      isActive: true,
      branchId: true,
      maxDiscountPercent: true,
    },
  });
}

export async function resolvePosDiscountActor({
  staffId,
  branchId,
  dependencies = {},
}: {
  staffId:
    | string
    | null
    | undefined;

  branchId:
    | string
    | null
    | undefined;

  dependencies?:
    PosDiscountActorDependencies;
}): Promise<DiscountActorInput> {
  const cleanStaffId =
    typeof staffId ===
      "string"
      ? staffId.trim()
      : "";

  const cleanBranchId =
    typeof branchId ===
      "string"
      ? branchId.trim()
      : "";

  /*
   * A discount requester must be a real
   * Staff record.
   *
   * The admin identity remains available
   * for authentication and manager approval,
   * but cashier discount authority belongs
   * to Staff.maxDiscountPercent.
   */
  if (!cleanStaffId) {
    throw new PosDiscountActorError(
      "Discounts require an active staff account linked to this login.",
      403
    );
  }

  if (!cleanBranchId) {
    throw new PosDiscountActorError(
      "No branch is assigned to this account.",
      400
    );
  }

  const findStaffById =
    dependencies.findStaffById ??
    defaultFindStaffById;

  const staff =
    await findStaffById(
      cleanStaffId
    );

  if (
    !staff ||
    !staff.isActive
  ) {
    throw new PosDiscountActorError(
      "The staff account requesting this discount is not active.",
      403
    );
  }

  /*
   * Discount authority is branch-scoped.
   *
   * A stale or manipulated session must not
   * permit one branch's staff member to apply
   * discounts against another branch.
   */
  if (
    staff.branchId !==
    cleanBranchId
  ) {
    throw new PosDiscountActorError(
      "The staff account does not belong to the active POS branch.",
      403
    );
  }

  return {
    id:
      staff.id,

    name:
      staff.name,

    role:
      staff.role,

    /*
     * null is intentional.
     *
     * The discount engine interprets a null
     * automatic authority as requiring manager
     * approval. We do not invent a fallback
     * percentage.
     */
    maxDiscountPercent:
      staff.maxDiscountPercent,
  };
}