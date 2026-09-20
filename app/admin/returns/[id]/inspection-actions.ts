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

  const canInspectReturns =
    isSuperAdmin ||
    staff.role ===
      "MANAGER";

  if (!canInspectReturns) {
    throw new Error(
      "You do not have permission to inspect returns."
    );
  }

  return {
    session,
    staff,
    isSuperAdmin,
  };
}

export async function saveInspection(
  returnId: string,
  inspectionNotes: string
) {
  const {
    session,
    isSuperAdmin,
  } =
    await requireReturnManager();

  const cleanReturnId =
    String(
      returnId ?? ""
    ).trim();

  const cleanInspectionNotes =
    String(
      inspectionNotes ?? ""
    ).trim();

  if (!cleanReturnId) {
    throw new Error(
      "Return ID is required."
    );
  }

  if (!cleanInspectionNotes) {
    throw new Error(
      "Inspection notes are required."
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
        approvedByStaffId: true,
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
      "You do not have permission to inspect returns for this branch."
    );
  }

  if (
    existingReturn.status !==
    "APPROVED"
  ) {
    throw new Error(
      "Only approved returns can be inspected."
    );
  }

  if (
    !existingReturn.approvedByStaffId
  ) {
    throw new Error(
      "This return has not been properly approved."
    );
  }

  /*
   * Preserve approvedByStaffId.
   *
   * The current ReturnRequest schema has no
   * dedicated inspectedByStaffId or
   * inspectionNotes fields. We therefore
   * retain the original approval identity and
   * use the existing decision-notes field for
   * inspection notes until a dedicated audit
   * model/fields are added in a future change.
   */
  await prisma.returnRequest.update({
    where: {
      id:
        cleanReturnId,
    },
    data: {
      status:
        "INSPECTED",

      managerDecisionReason:
        cleanInspectionNotes,
    },
  });

  revalidatePath(
    `/admin/returns/${cleanReturnId}`
  );
}
