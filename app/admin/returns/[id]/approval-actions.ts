"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";
import { revalidatePath } from "next/cache";

export async function approveReturn(returnId: string) {
  const admin = await requireAdmin();

  await prisma.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "APPROVED",
      approvedByStaffId: admin.staffId,
    },
  });

  revalidatePath(`/admin/returns/${returnId}`);
}

export async function rejectReturn(
  returnId: string,
  reason: string
) {
  const admin = await requireAdmin();

  await prisma.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "REJECTED",
      approvedByStaffId: admin.staffId,
      managerDecisionReason: reason,
    },
  });

  revalidatePath(`/admin/returns/${returnId}`);
}