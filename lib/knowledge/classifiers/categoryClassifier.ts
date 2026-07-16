import { prisma } from "@/lib/prisma";
import { CATEGORY_SLUG_MAPPING } from "./mappings";

export async function classifyByCategorySlug(categorySlug?: string) {
  if (!categorySlug) {
    return null;
  }

  const nodeCode = CATEGORY_SLUG_MAPPING[categorySlug];

  if (!nodeCode) {
    return null;
  }

  return prisma.knowledgeNode.findUnique({
    where: {
      code: nodeCode,
    },
  });
}