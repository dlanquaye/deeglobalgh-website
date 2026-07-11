import { prisma } from "@/lib/prisma";

export async function findEstimateRequest(estimateId: string) {
  
     // First verify the estimate exists
    const estimate = await prisma.estimateRequest.findUnique({
      where: {
        id: estimateId,
      },
    });

    return estimate;

}