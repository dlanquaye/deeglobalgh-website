import { prisma } from "@/lib/prisma";

export async function getEstimateAttachments(
  estimateId: string
) {
  return prisma.estimateAttachment.findMany({
    where: {
      estimateRequestId: estimateId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}