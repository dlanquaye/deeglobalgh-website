import { prisma } from "@/lib/prisma";

export async function assignProductToKnowledgeNode(
  productId: string,
  knowledgeNodeCode: string
) {
  const node = await prisma.knowledgeNode.findUnique({
    where: {
      code: knowledgeNodeCode,
    },
  });

  if (!node) {
    throw new Error(`Knowledge node '${knowledgeNodeCode}' not found.`);
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      knowledgeNodeId: node.id,
    },
  });
}

export async function getProductsForKnowledgeNode(
  knowledgeNodeCode: string
) {
  const node = await prisma.knowledgeNode.findUnique({
    where: {
      code: knowledgeNodeCode,
    },
    select: {
      id: true,
    },
  });

  if (!node) {
    return [];
  }

  return prisma.product.findMany({
    where: {
      knowledgeNodeId: node.id,
    },
    orderBy: {
      name: "asc",
    },
  });

}