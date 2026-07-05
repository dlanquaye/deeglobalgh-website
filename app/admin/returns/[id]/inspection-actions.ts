"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/app/lib/adminAuth";
import { revalidatePath } from "next/cache";

export async function saveInspection(
  returnId: string,
  inspectionNotes: string
) {
  const admin = await requireAdmin();

  await prisma.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "INSPECTED",
      approvedByStaffId: admin.staffId,
      managerDecisionReason: inspectionNotes,
    },
  });

  revalidatePath(`/admin/returns/${returnId}`);
}