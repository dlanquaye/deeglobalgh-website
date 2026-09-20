"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/adminAuth";
import { prisma } from "@/lib/prisma";

async function requireReturnManager() {
  const session =
    await requireAdmin();

  if (!session.staffId) {
    throw new Error(
      "An active linked staff account is required."
    );
  }

  const staff =
    await prisma.staff.findUnique({
      where: {
        id: session.staffId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        branchId: true,
      },
    });

  if (
    !staff ||
    !staff.isActive
  ) {
    throw new Error(
      "An active staff account is required."
    );
  }

  const isSuperAdmin =
    session.role ===
      "SUPER_ADMIN" ||
    staff.role ===
      "SUPER_ADMIN";

  const canApproveReturns =
    isSuperAdmin ||
    staff.role ===
      "MANAGER";

  if (!canApproveReturns) {
    throw new Error(
      "You do not have permission to approve or reject returns."
    );
  }

  return {
    session,
    staff,
    isSuperAdmin,
  };
}

export async function approveReturn(
  returnId: string
) {
  const {
    session,
    staff,
    isSuperAdmin,
  } =
    await requireReturnManager();

  const cleanReturnId =
    String(
      returnId ?? ""
    ).trim();

  if (!cleanReturnId) {
    throw new Error(
      "Return ID is required."
    );
  }

  const existingReturn =
    await prisma.returnRequest.findUnique({
      where: {
        id: cleanReturnId,
      },
      select: {
        id: true,
        branchId: true,
        status: true,
      },
    });

  if (!existingReturn) {
    throw new Error(
      "Return request not found."
    );
  }

  if (
    !isSuperAdmin &&
    existingReturn.branchId !==
      session.branchId
  ) {
    throw new Error(
      "You do not have permission to approve returns for this branch."
    );
  }

  if (
    existingReturn.status !==
    "PENDING"
  ) {
    throw new Error(
      "Only pending returns can be approved."
    );
  }

  await prisma.returnRequest.update({
    where: {
      id:
        cleanReturnId,
    },
    data: {
      status:
        "APPROVED",

      approvedByStaffId:
        staff.id,
    },
  });

  revalidatePath(
    `/admin/returns/${cleanReturnId}`
  );
}

export async function rejectReturn(
  returnId: string,
  reason: string
) {
  const {
    session,
    staff,
    isSuperAdmin,
  } =
    await requireReturnManager();

  const cleanReturnId =
    String(
      returnId ?? ""
    ).trim();

  const cleanReason =
    String(
      reason ?? ""
    ).trim();

  if (!cleanReturnId) {
    throw new Error(
      "Return ID is required."
    );
  }

  if (!cleanReason) {
    throw new Error(
      "A rejection reason is required."
    );
  }

  const existingReturn =
    await prisma.returnRequest.findUnique({
      where: {
        id:
          cleanReturnId,
      },
      select: {
        id: true,
        branchId: true,
        status: true,
      },
    });

  if (!existingReturn) {
    throw new Error(
      "Return request not found."
    );
  }

  if (
    !isSuperAdmin &&
    existingReturn.branchId !==
      session.branchId
  ) {
    throw new Error(
      "You do not have permission to reject returns for this branch."
    );
  }

  if (
    existingReturn.status !==
    "PENDING"
  ) {
    throw new Error(
      "Only pending returns can be rejected."
    );
  }

  await prisma.returnRequest.update({
    where: {
      id:
        cleanReturnId,
    },
    data: {
      status:
        "REJECTED",

      approvedByStaffId:
        staff.id,

      managerDecisionReason:
        cleanReason,
    },
  });

  revalidatePath(
    `/admin/returns/${cleanReturnId}`
  );
}
