import { prisma } from "@/lib/prisma";

export async function createEstimateItem(
  estimateId: string,
  productName: string,
  quantity: number
) {
  const existingItems = await prisma.estimateItem.count({
    where: {
      estimateRequestId: estimateId,
    },
  });

  const nextLineNumber = existingItems + 1;

  const item = await prisma.estimateItem.create({
    data: {
      estimateRequestId: estimateId,
      lineNumber: nextLineNumber,
      description: productName,
      quantity,
    },
  });

  return item;
}